const HttpError = require("../utils/http-error");

module.exports = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    throw new HttpError(400, error.details[0].message);
  }

  req.body = value;
  next();
};
