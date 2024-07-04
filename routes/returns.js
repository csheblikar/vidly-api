const express = require("express");
const HttpError = require("../utils/http-error");
const Rental = require("../models/rental");
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

  await rental.return(req.body.movie);
  await rental.save();

  res.status(200).send({ data: rental });
});

module.exports = router;
