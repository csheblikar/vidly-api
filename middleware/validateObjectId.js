const mongoose = require("mongoose");
const HttpError = require("../utils/http-error");

module.exports = function (req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new HttpError(404, "Invalid ID");
  }

  next();
};
