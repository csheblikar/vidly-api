const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true },
);

const Genre = mongoose.model("genre", genreSchema);

exports.Genre = Genre;
exports.genreSchema = genreSchema;
