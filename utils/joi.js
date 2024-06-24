const Joi = require("joi");

const objectId = Joi.string().regex(/^[0-9a-fA-f]{24}$/);

const customerSchema = Joi.object({
  name: Joi.string().min(5).required(),
  isGold: Joi.boolean().required(),
  phone: Joi.string().min(10).required(),
});

const genreSchema = Joi.object({
  name: Joi.string().min(5).trim().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

const movieSchema = Joi.object({
  title: Joi.string().min(5).max(50).required(),
  genre: objectId.required(),
  numberInStock: Joi.number().min(0).required(),
  dailyRentalRate: Joi.number().min(0).required(),
});

const rentalSchema = Joi.object({
  customer: objectId.required(),
  movie: objectId.required(),
});

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().min(8).max(50).required(),
  isAdmin: Joi.boolean().required(),
});

module.exports.customerSchema = customerSchema;
module.exports.genreSchema = genreSchema;
module.exports.loginsSchema = loginSchema;
module.exports.movieSchema = movieSchema;
module.exports.rentalSchema = rentalSchema;
module.exports.userSchema = userSchema;
