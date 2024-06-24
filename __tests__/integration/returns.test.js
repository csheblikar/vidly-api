const app = require("../../app");
const mongoose = require("mongoose");
const Customer = require("../../models/customer");
const Movie = require("../../models/movie");
const Rental = require("../../models/rental");
const request = require("supertest");
const User = require("../../models/user");
const moment = require("moment");

describe("/api/returns", () => {
  let token;
  let rental;
  let movie;
  let customerId;
  let movieId;

  beforeEach(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const customer = await Customer.create({
      name: "customer1",
      phone: "1234567890",
    });

    movie = await Movie.create({
      title: "movie1",
      genre: new mongoose.Types.ObjectId(),
      numberInStock: 1,
      dailyRentalRate: 2,
    });

    rental = await Rental.create({ movie: movie._id, customer: customer._id });
    customerId = customer._id;
    movieId = movie._id;
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  const exec = () =>
    request(app)
      .post("/api/returns")
      .set("authorization", `Bearer ${token}`)
      .send({ customer: customerId, movie: movieId });

  it("should return 401 if client is not logged in", async () => {
    token = "";
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if customer id is not provided", async () => {
    customerId = "";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 400 if movie id is not provided", async () => {
    movieId = "";
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental is found with customer/movie combination", async () => {
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();

    // await Rental.remove({});

    const res = await exec();
    expect(res.status).toBe(404);
  });

  it("should return 400 if return already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if valid request", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it("should set the return date if input is valid", async () => {
    await exec();

    const rentalInDb = await Rental.findOne({ _id: rental._id });
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rental fee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();

    await exec();

    const rentalInDb = await Rental.findOne({ _id: rental._id });
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increase the stock in the movie", async () => {
    await exec();

    const movieInDb = await Movie.findOne({ _id: movieId });
    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rental in the body of the response", async () => {
    const res = await exec();

    expect(Object.keys(res.body.data)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ]),
    );
  });
});
