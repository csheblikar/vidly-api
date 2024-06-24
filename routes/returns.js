const express = require("express");
const HttpError = require("../utils/http-error");
const Rental = require("../models/rental");
const Movie = require("../models/movie");
const moment = require("moment");
const validate = require("../middleware/validate");
const { rentalSchema } = require("../utils/joi");

const router = express.Router();

router.post("/", validate(rentalSchema), async (req, res) => {
  const rental = await Rental.findOne({
    customer: req.body.customer,
    movie: req.body.movie,
  });

  if (!rental) {
    throw new HttpError(404, "Rental not found");
  }

  if (rental.dateReturned) {
    throw new HttpError(400, "Return already processed");
  }

  rental.dateReturned = new Date();

  const movie = await Movie.findOne({ _id: req.body.movie });
  rental.rentalFee =
    moment().diff(rental.dateOut, "days") * movie.dailyRentalRate;

  await rental.save();

  movie.numberInStock++;
  await movie.save();

  res.status(200).send({ data: rental });
});

module.exports = router;
