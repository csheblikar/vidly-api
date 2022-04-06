const jwt = require('jsonwebtoken');
const config = require('config');
const HttpError = require('../lib/http-error');

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) throw new HttpError(401, 'Access denied. No token provided');

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    req.user = decoded;
    next();
};
