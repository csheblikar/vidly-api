const admin = require("../middleware/admin");
const HttpError = require("../utils/http-error");
const Joi = require("joi");
const express = require("express");
const { Genre } = require("../models/genre");
const Movie = require("../models/movie");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().min(5).trim().required(),
});

router.get("/", async (req, res) => {
  const genres = await Genre.find();
  res.send({ data: genres });
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    throw new HttpError(404, "Genre with the given ID not found");
  }

  res.send({ data: genre });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = new Genre({ name: value.name });
  await genre.save();

  res.send({ data: genre });
});

router.put("/:id", validateObjectId, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    {
      name: value.name,
    },
    { new: true },
  );

  if (!genre) {
    throw new HttpError(404, "Genre with the given ID not found");
  }

  res.send({ data: genre });
});

router.delete("/:id", validateObjectId, admin, async (req, res) => {
  const genre = await Genre.findOne({ _id: req.params.id });
  if (!genre) {
    throw new HttpError(404, "Genre not found");
  }

  const hasMovies = await Movie.exists({ genre: genre._id });
  if (hasMovies) {
    throw new HttpError(400, "Unable to delete genre");
  }

  await genre.deleteOne();

  res.send({ data: genre });
});

module.exports = router;
