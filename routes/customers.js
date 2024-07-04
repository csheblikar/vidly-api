const admin = require("../middleware/admin");
const express = require("express");
const HttpError = require("../utils/http-error");
const Customer = require("../models/customer");
const validateObjectId = require("../middleware/validateObjectId");
const { customerSchema } = require("../utils/joi");
const validate = require("../middleware/validate");

const router = express.Router();

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

router.post("/", validate(customerSchema), async (req, res) => {
  const customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });

  await customer.save();
  res.send({ data: customer });
});

router.put(
  "/:id",
  validate(customerSchema),
  validateObjectId,
  async (req, res) => {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body },
      { new: true },
    );

    if (!customer) {
      throw new HttpError(404, "Customer with the given ID not found");
    }

    res.send({ data: customer });
  },
);

router.delete("/:id", validateObjectId, admin, async (req, res) => {
  const customer = await Customer.findOneAndDelete({ _id: req.params.id });

  if (!customer) {
    throw new HttpError(404, "Customer with the given ID not found");
  }

  res.send({ data: customer });
});

module.exports = router;
