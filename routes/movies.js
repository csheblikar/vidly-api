const express = require("express");
const HttpError = require("../utils/http-error");
const Movie = require("../models/movie");
const { Genre } = require("../models/genre");
const { movieSchema } = require("../utils/joi");

const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movie.find();

  res.send({ data: movies });
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findOne({ _id: req.params.id }).populate("genre");
  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }

  res.send({ data: movie });
});

router.post("/", async (req, res) => {
  const { error, value } = movieSchema.validate(req.body);
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    throw new HttpError(404, "Genre not found");
  }

  const movie = new Movie({ ...value, genre: genre._id });
  await movie.save();
  await movie.populate("genre");

  res.send({ data: movie });
});

router.put("/:id", async (req, res) => {
  const { error, value } = movieSchema.validate(req.body);
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    throw new HttpError(404, "Genre not found");
  }

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    { ...value, genre: genre._id },
    { new: true },
  ).populate("genre");

  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }

  res.send({ data: movie });
});

router.delete("/:id", async (req, res) => {
  const movie = await Movie.findOneAndDelete({ _id: req.params.id });

  if (!movie) {
    throw new HttpError(404, "Movie not found");
  }

  res.send({ data: movie });
});

module.exports = router;
