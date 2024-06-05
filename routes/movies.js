const express = require("express");
const Joi = require("joi");
const Movie = require("../models/movie");
const { Genre } = require("../models/genre");

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().min(5).max(50).required(),
  genreId: Joi.string().required(),
  numberInStock: Joi.number().min(0).required(),
  dailyRentalRate: Joi.number().min(0).required(),
});

router.get("/", async (req, res) => {
  const movies = await Movie.find();

  res.send({ data: movies });
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findOne({ _id: req.params.id });
  if (!movie) {
    res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ error: error.details[0].message });
  }

  const genre = await Genre.findOne({ _id: value.genreId });
  if (!genre) {
    res.status(404).send({ error: "Genre not found" });
  }

  let movie = new Movie({
    title: value.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: value.numberInStock,
    dailyRentalRate: value.dailyRentalRate,
  });
  movie = await movie.save();

  res.send({ data: movie });
});

router.put("/:id", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ error: error.details[0].message });
  }

  const genre = await Genre.findOne({ _id: value.genreId });
  if (!genre) {
    res.status(404).send({ error: "Genre not found" });
  }

  const movie = await Movie.findOneAndUpdate(
    { _id: req.params.id },
    {
      title: value.title,
      genre: {
        _id: genre._id,
        name: genre.name,
      },
      numberInStock: value.numberInStock,
      dailyRentalRate: value.dailyRentalRate,
    },
    { new: true },
  );

  if (!movie) {
    res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

router.delete("/:id", async (req, res) => {
  const movie = await Movie.findOneAndDelete({ _id: req.params.id });

  if (!movie) {
    res.status(404).send({ error: "Movie not found" });
  }

  res.send({ data: movie });
});

module.exports = router;
