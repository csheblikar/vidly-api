const auth = require("../middleware/auth");
const express = require("express");
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
    return res.status(400).send({ error: error.details[0].message });
  }
  const session = await Rental.startSession();

  session.withTransaction(async () => {
    const customer = await Customer.findOne({ _id: value.customer }).session(
      session,
    );
    if (!customer) {
      return res.status(400).send({ error: "Invalid customer" });
    }

    const movie = await Movie.findOne({ _id: value.movie }).session(session);
    if (!movie) {
      return res.status(400).send({ error: "Invalid movie" });
    }

    if (movie.numberInStock === 0) {
      return res.status(400).send({ error: "Movie not in stock" });
    }

    movie.numberInStock--;
    await movie.save({ session });

    const rental = new Rental({ customer: customer._id, movie: movie._id });
    await rental.save({ session });

    res.send({ data: rental });
  });
});

module.exports = router;
