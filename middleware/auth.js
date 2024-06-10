const config = require("config");
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send({ error: "Access denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.get("privateKey"));
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).send({ error: "Invalid token" });
  }
}

module.exports = auth;
