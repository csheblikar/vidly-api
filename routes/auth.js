const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../models/user');
const HttpError = require('../lib/http-error');

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        throw new HttpError(400, error.details[0].message);
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) throw new HttpError(400, 'Invalid email or password');

    const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );
    if (!validPassword) throw new HttpError(400, 'Invalid email or password');

    const token = user.generateAuthToken();
    res.send(token);
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(req);
}
module.exports = router;
