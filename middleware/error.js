const { UnauthorizedError } = require("express-jwt");
const HttpError = require("../utils/http-error");

module.exports = (error, req, res, next) => {
  if (error instanceof HttpError) {
    res.status(error.statusCode).send({ error: error.message });
  } else if (error instanceof UnauthorizedError) {
    res.status(error.status).send({ error: error.message });
  } else {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
};
