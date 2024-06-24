const express = require("express");
const HttpError = require("../utils/http-error");
const Joi = require("joi");
const Rental = require("../models/rental");
const Customer = require("../models/customer");
const Movie = require("../models/movie");

const router = express.Router();

const schema = Joi.object({
  customer: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
  movie: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required(),
});

router.get("/", async (req, res) => {
  const rentals = await Rental.find().populate("customer movie");

  res.send({ data: rentals });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }
  const session = await Rental.startSession();

  session.withTransaction(async () => {
    const customer = await Customer.findOne({ _id: value.customer }).session(
      session,
    );
    if (!customer) {
      throw new HttpError(400, "Invalid customer");
    }

    const movie = await Movie.findOne({ _id: value.movie }).session(session);
    if (!movie) {
      throw new HttpError(400, "Invalid movie");
    }

    if (movie.numberInStock === 0) {
      throw new HttpError(400, "Movie not in stock");
    }

    movie.numberInStock--;
    await movie.save({ session });

    const rental = new Rental({ customer: customer._id, movie: movie._id });
    await rental.save({ session });

    res.send({ data: rental });
  });
});

module.exports = router;
