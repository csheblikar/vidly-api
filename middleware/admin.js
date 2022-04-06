const HttpError = require('../lib/http-error');

module.exports = function (req, res, next) {
    // 401 Unauthorized
    // 403 Forbidden

    if (!req.user.isAdmin) {
        throw new HttpError(403, 'Access Denied.');
    }
    next();
};
