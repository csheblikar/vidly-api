const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre");
const User = require("../../models/user");

describe("/api/genres", () => {
  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.insertMany([{ name: "genre1" }, { name: "genre2" }]);

      const res = await request(app).get("/api/genres");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.data.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return a genre if valid id is passed", async () => {
      const genre = await Genre.create({ name: "genre1" });

      const res = await request(app).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ name: genre.name });
    });

    it("should return 404 if invalid id is passed", async () => {
      const res = await request(app).get("/api/genres/1");
      expect(res.status).toBe(404);
    });
  });

  describe("POST  /", () => {
    let token;
    let name;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    const exec = async () => {
      return await request(app)
        .post("/api/genres")
        .set("authorization", `Bearer ${token}`)
        .send({ name });
    };

    it("should return 401 if client is not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    // don't have to check this because we're using express-jwt for auth
    // it("should return 401 if token is invalid", async () => {
    //   token = "1234";
    //   const res = await exec();
    //   expect(res.status).toBe(401);
    // });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should save the genre if it is valid", async () => {
      await exec();

      const genre = await Genre.findOne({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("should have the genre in the body of the response", async () => {
      const res = await exec();

      console.log("res.body: " + res.body);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data).toHaveProperty("name", "genre1");
    });
  });
});
