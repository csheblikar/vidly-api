const bcrypt = require("bcrypt");
const express = require("express");
const HttpError = require("../utils/http-error");
const Joi = require("joi");
const User = require("../models/user");

const router = express.Router();

const schema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required(),
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    throw new HttpError(400, "Invalid email or password");
  }

  const valid = await bcrypt.compare(value.password, user.password);
  if (!valid) {
    throw new HttpError(400, "Invalid email or password");
  }

  const token = user.generateAuthToken();
  res.send({ data: token });
});

module.exports = router;
