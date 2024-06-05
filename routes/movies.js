const express = require("express");
const Joi = require("joi");
const Movie = require("../models/movie");
const { Genre } = require("../models/genre");

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().min(5).max(50).required(),
  genre: Joi.string().required(),
  numberInStock: Joi.number().min(0).required(),
  dailyRentalRate: Joi.number().min(0).required(),
});

router.get("/", async (req, res) => {
  const movies = await Movie.find();

  res.send({ data: movies });
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findOne({ _id: req.params.id }).populate("genre");
  if (!movie) {
    return res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    return res.status(404).send({ error: "Genre not found" });
  }

  const movie = new Movie({ ...value, genre: genre._id });
  await movie.save();
  await movie.populate("genre");

  res.send({ data: movie });
});

router.put("/:id", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const genre = await Genre.findOne({ _id: value.genre });
  if (!genre) {
    return res.status(404).send({ error: "Genre not found" });
  }

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    { ...value, genre: genre._id },
    { new: true },
  ).populate("genre");

  if (!movie) {
    return res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

router.delete("/:id", async (req, res) => {
  const movie = await Movie.findOneAndDelete({ _id: req.params.id });

  if (!movie) {
    return res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

module.exports = router;
