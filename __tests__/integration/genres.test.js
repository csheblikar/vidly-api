const request = require("supertest");
const app = require("../../app");
const mongoose = require("mongoose");
const { Genre } = require("../../models/genre");
const User = require("../../models/user");
const Movie = require("../../models/movie");

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

    it("should return 404 if genre not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/genres/" + id);

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

    // don't have to check invalid token because we're using express-jwt for auth

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

      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /", () => {
    let token;
    let name;
    let id;

    beforeEach(async () => {
      token = new User().generateAuthToken();
      const genre = await Genre.create({ name: "genre1" });
      name = "genre2";
      id = genre._id;
    });

    const exec = () => {
      return request(app)
        .put("/api/genres/" + id)
        .set("authorization", `Bearer ${token}`)
        .send({ name });
    };

    it("should update the genre if the name is valid", async () => {
      await exec();

      const genre = Genre.findOne({ name: "genre2" });
      expect(genre).not.toBeNull();
    });

    it("should have the genre in the body of the response", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ name });
    });

    it("should return 401 if user is not logged in", async () => {
      token = "";
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if invalid genre id is passed", async () => {
      id = "1234";

      const res = await exec();
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /", () => {
    let token;
    let id;

    beforeEach(async () => {
      const genre = await Genre.create({ name: "genre1" });
      const user = new User({ isAdmin: true });
      id = genre._id;
      token = user.generateAuthToken();
    });

    const exec = () => {
      return request(app)
        .delete("/api/genres/" + id)
        .set("authorization", `Bearer ${token}`);
    };

    it("should return 200 if genre is deleted", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should delete the genre if valid genre id is passed", async () => {
      await exec();

      const genre = await Genre.findOne({ name: "genre1" });
      expect(genre).toBeNull();
    });

    it("should return 400 if genre id is present in movies collection", async () => {
      await Movie.create({
        title: "movie1",
        genre: id,
        numberInStock: 1,
        dailyRentalRate: 10,
      });

      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre id is valid and not found", async () => {
      id = new mongoose.Types.ObjectId();

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 404 if genre id is invalid", async () => {
      id = "1234";

      const res = await exec();
      expect(res.status).toBe(404);
    });

    it("should return 401 user not logged in", async () => {
      token = "";

      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(403);
    });
  });
});
