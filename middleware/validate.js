const HttpError = require('../lib/http-error');

module.exports = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);
        if (error) {
            throw new HttpError(400, error.details[0].message);
        }
        next();
    };
};
