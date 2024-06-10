const config = require("config");
const jwt = require("jsonwebtoken");

function admin(req, res, next) {
  if (!req.user.isAdmin) {
    return res.status(403).send({ error: "Access denied" });
  }

  next();
}

module.exports = admin;
