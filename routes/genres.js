const auth = require("../middleware/auth");
const Joi = require("joi");
const express = require("express");
const { Genre } = require("../models/genre");
const Movie = require("../models/movie");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().min(5).trim().required(),
});

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send({ data: genres });
});

router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    return res.status(404).send({ error: "Genre with the given ID not found" });
  }

  res.send({ data: genre });
});

router.post("/", auth, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const genre = new Genre({ name: value.name });
  await genre.save();

  res.send({ data: genre });
});

router.put("/:id", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      name: value.name,
    },
    { new: true },
  );

  if (!genre) {
    return res.status(404).send({ error: "Genre with the given ID not found" });
  }

  res.send({ data: genre });
});

router.delete("/:id", async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id });
  if (!genre) {
    return res.status(404).send({ error: "Genre not found" });
  }

  const hasMovies = await Movie.exists({ genre: genre._id });
  if (hasMovies) {
    return res.status(400).send({ error: "Unable to delete genre" });
  }

  await genre.deleteOne();

  res.send({ data: genre });
});

module.exports = router;
