const bcrypt = require("bcrypt");
const express = require("express");
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
    return res.status(400).send({ error: error.details[0].message });
  }

  const user = await User.findOne({ email: value.email });
  if (!user) {
    return res.status(400).send({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(value.password, user.password);
  if (!valid) {
    return res.status(400).send({ error: "Invalid email or password" });
  }

  const token = user.generateAuthToken();
  res.send({ data: token });
});

module.exports = router;
