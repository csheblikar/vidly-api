const bcrypt = require("bcrypt");
const config = require("config");
const express = require("express");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required().email(),
  password: Joi.string().min(8).max(50).required(),
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    return res.status(400).send({ error: error.details[0].message });
  }

  let user = await User.findOne({ email: value.email });
  if (user) {
    return res.status(400).send({ error: "User already registered" });
  }

  user = new User({ ...value });
  const saltRounds = 10;
  user.password = await bcrypt.hash(value.password, saltRounds);

  await user.save();

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send({ data: user });
});

module.exports = router;
