const jwt = require('jsonwebtoken');
const config = require('config');
const HttpError = require('../lib/http-error');

module.exports = function (req, res, next) {
    const value = req.headers.authorization;
    if (!value) {
        throw new HttpError(401, 'Access denied. No token provided.');
    }

    const parts = value.split(' ');
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        throw new HttpError(401, 'Invalid authorization header format.');
    }

    const token = parts[1];
    if (!token) throw new HttpError(401, 'Access denied. No token provided');

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
};
