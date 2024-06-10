const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const value = req.headers.authorization;
  if (!value) {
    return res.status(401).send({ error: "Access denied. No token provided" });
  }

  const parts = value.split(" ");
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res
      .status(401)
      .send({ error: "Invalid authorization header format" });
  }

  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (ex) {
    res.status(401).send({ error: "Invalid token" });
  }
}

module.exports = auth;
