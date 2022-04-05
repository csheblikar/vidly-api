const winston = require('winston');

//TODO winston error log
// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
    //Log the exception
    winston.error(err.message, err);

    res.status(500).send('Something failed');
};
