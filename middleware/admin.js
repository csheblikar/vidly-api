function admin(req, res, next) {
  if (!req.user.admin) {
    return res.status(403).send({ error: "Access denied" });
  }

  next();
}

module.exports = admin;
