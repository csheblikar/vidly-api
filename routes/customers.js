const admin = require("../middleware/admin");
const express = require("express");
const HttpError = require("../utils/http-error");
const Joi = require("joi");
const Customer = require("../models/customer");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

const schema = Joi.object({
  name: Joi.string().min(5).required(),
  isGold: Joi.boolean().required(),
  phone: Joi.string().min(10).required(),
});

router.get("/", async (req, res) => {
  const customers = await Customer.find();

  res.send({ data: customers });
});

router.get("/:id", validateObjectId, async (req, res) => {
  const customer = await Customer.findOne({ _id: req.params.id });
  if (!customer) {
    throw new HttpError(404, "Customer with the given ID not found");
  }

  res.send({ data: customer });
});

router.post("/", async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const customer = new Customer({
    name: value.name,
    isGold: value.isGold,
    phone: value.phone,
  });

  await customer.save();
  res.send({ data: customer });
});

router.put("/:id", validateObjectId, async (req, res) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id },
    { ...value },
    { new: true },
  );

  if (!customer) {
    throw new HttpError(404, "Customer with the given ID not found");
  }

  res.send({ data: customer });
});

router.delete("/:id", validateObjectId, admin, async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id });

  if (!customer) {
    throw new HttpError(404, "Customer with the given ID not found");
  }

  res.send({ data: customer });
});

module.exports = router;
