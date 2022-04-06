const auth = require('../middleware/auth');
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const HttpError = require('../lib/http-error');

// TODO password complexity

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        throw new HttpError(400, error.details[0].message);
    }

    let user = await User.findOne({ email: req.body.email });
    if (user) {
        throw new HttpError(400, 'User already registered');
    }
    user = new User(_.pick(req.body, ['name', 'email', 'password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(
        _.pick(user, ['_id', 'name', 'email'])
    );
});

module.exports = router;
