const bcrypt = require("bcrypt");
const express = require("express");
const HttpError = require("../utils/http-error");
const User = require("../models/user");
const { rentalSchema } = require("../utils/joi");

const router = express.Router();

router.get("/me", async (req, res) => {
  const user = await User.findOne({ _id: req.user.sub });

  res.send({ data: user });
});

router.post("/", async (req, res) => {
  const { error, value } = rentalSchema.validate(req.body, {
    stripUnknown: true,
  });
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
