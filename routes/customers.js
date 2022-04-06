const { Customer, validate } = require('../models/customer');
const express = require('express');
const HttpError = require('../lib/http-error');
const router = express.Router();

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) throw new HttpError(400, error.details[0].message);

    let customer = new Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });
    customer = await customer.save();
    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) throw new HttpError(400, error.details[0].message);

    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phone: req.body.phone,
            isGold: req.body.isGold
        },
        {
            new: true
        }
    );
    if (!customer) {
        throw new HttpError(
            404,
            'The customer with the given ID was not found.'
        );
    }

    res.send(customer);
});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) {
        throw new HttpError(
            404,
            'The customer with the given ID was not found.'
        );
    }

    res.send(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
        throw new HttpError(
            404,
            'The customer with the given ID was not found.'
        );
    }

    res.send(customer);
});

module.exports = router;
