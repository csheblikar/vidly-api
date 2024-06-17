const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const HttpError = require("../utils/http-error");
const Joi = require("joi");
const User = require("../models/user");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().min(8).max(50).required(),
  isAdmin: Joi.boolean().required(),
});

router.get("/me", async (req, res) => {
  const user = await User.findOne({ _id: req.user.sub });

  res.send({ data: user });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  let user = await User.findOne({ email: value.email });
  if (user) {
    throw new HttpError(400, "User already registered");
  }

  user = new User({ ...value });
  user.password = await bcrypt.hash(value.password, 12);

  await user.save();

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send({ data: user });
});

module.exports = router;
