const app = require("../../app");
const Customer = require("../../models/customer");
const mongoose = require("mongoose");
const request = require("supertest");
const User = require("../../models/user");

describe("/api/customers", () => {
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      await Customer.insertMany([
        { name: "customer1", isGold: true, phone: "1234567890" },
        { name: "customer2", isGold: false, phone: "1234567891" },
      ]);

      const token = new User().generateAuthToken();

      const res = await request(app)
        .get("/api/customers")
        .set("authorization", `Bearer ${token}`);

      console.log("customers: " + res.body.data[1].name);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some((c) => c.name === "customer1")).toBeTruthy();
      expect(res.body.data.some((c) => c.name === "customer2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    let token;
    let id;

    beforeEach(async () => {
      const customer = await Customer.create({
        name: "customer1",
        isGold: true,
        phone: "1234567890",
      });

      id = customer._id;
      token = new User().generateAuthToken();
    });

    const exec = () => {
      return request(app)
        .get("/api/customers/" + id)
        .set("authorization", `Bearer ${token}`);
    };

    it("should return customer if the id is valid and it exists", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ name: "customer1" });
    });

    it("should return 404 if customer not found", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if invalid customer id is passed", async () => {
      id = "1234";
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 401 if not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });
  });

  describe("POST /", () => {
    let token;
    let name;
    let phone;

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "customer1";
      phone = "1234567890";
    });

    const exec = () => {
      return request(app)
        .post("/api/customers")
        .set("authorization", `Bearer ${token}`)
        .send({ name, isGold: true, phone });
    };

    it("should return 200 if valid customer object is passed", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should save the valid customer object", async () => {
      await exec();

      const customer = await Customer.findOne({ name: "customer1" });
      expect(customer).not.toBeNull();
    });

    it("should return 400 if name is less than 3 characters", async () => {
      name = "1234";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 10 characters", async () => {
      phone = "1234";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();
      expect(res.status).toBe(401);
    });
  });

  describe("PUT /:id", () => {
    let token;
    let name;
    let phone;
    let id;

    beforeEach(async () => {
      const customer = await Customer.create({
        name: "customer1",
        isGold: true,
        phone: "1234567890",
      });

      token = new User().generateAuthToken();
      name = "customer2";
      phone = "8888888888";
      id = customer._id;
    });

    const exec = () => {
      return request(app)
        .put("/api/customers/" + id)
        .set("authorization", `Bearer ${token}`)
        .send({ name, isGold: true, phone });
    };

    it("should return 200 if valid customer object is passed", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should update the valid customer object", async () => {
      await exec();

      const customer = await Customer.findOne({ name: "customer2" });
      expect(customer).not.toBeNull();
    });

    it("should return 400 if name is less than 3 characters", async () => {
      name = "1234";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if phone is less than 10 characters", async () => {
      phone = "1234";

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if customer id is invalid", async () => {
      id = "1";

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();
      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let id;

    beforeEach(async () => {
      const customer = await Customer.create({
        name: "customer1",
        isGold: true,
        phone: "1234567890",
      });

      const user = new User({ isAdmin: true });

      token = user.generateAuthToken();
      id = customer._id;
    });

    const exec = () => {
      return request(app)
        .delete("/api/customers/" + id)
        .set("authorization", `Bearer ${token}`);
    };

    it("should return 200 if valid customer object is passed", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should delete the valid customer object", async () => {
      await exec();

      const customer = await Customer.findOne({ name: "customer1" });
      expect(customer).toBeNull();
    });

    it("should return 404 if customer not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if customer id is invalid", async () => {
      id = "1";

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";

      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not logged in", async () => {
      token = new User().generateAuthToken();

      const res = await exec();
      expect(res.status).toBe(403);
    });
  });
});
