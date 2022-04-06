const winston = require('winston');
const { JsonWebTokenError } = require('jsonwebtoken');
const HttpError = require('../lib/http-error');

//TODO winston error log
// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
    //Log the exception
    winston.error(err.message, err);

    if (err instanceof HttpError) {
        res.status(err.statusCode).send(err.message);
    } else if (err instanceof JsonWebTokenError) {
        res.status(400).send('Invalid Token.');
    } else {
        res.status(500).send('Something failed');
    }
};
