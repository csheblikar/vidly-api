const mongoose = require("mongoose");
const moment = require("moment");
const Movie = require("./movie");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "movie", required: true },
  dateOut: { type: Date, default: Date.now },
  dateReturned: { type: Date },
  rentalFee: { type: Number, min: 0 },
});

rentalSchema.methods.return = async function (movieId) {
  this.dateReturned = new Date();

  const movie = await Movie.findOne({ _id: movieId });
  this.rentalFee = moment().diff(this.dateOut, "days") * movie.dailyRentalRate;

  movie.numberInStock++;
  await movie.save();
};

const Rental = mongoose.model("rental", rentalSchema);

module.exports = Rental;
