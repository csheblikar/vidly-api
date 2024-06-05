const mongoose = require("mongoose");

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

const Rental = mongoose.model("rental", rentalSchema);

module.exports = Rental;
