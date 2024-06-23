const express = require("express");
require("express-async-errors");
const { expressjwt: expressJwt } = require("express-jwt");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    credentialsRequired: true,
    requestProperty: "user", // by default it's "auth"
  }).unless({
    path: [
      "/api/logins",
      { url: /^\/api\/movies(\/.*)?$/, method: "GET" },
      { url: /^\/api\/genres(\/.*)?$/, method: "GET" },
      { url: "/api/users", method: "POST" },
    ],
  }),
);

app.use("/api/genres", require("./routes/genres"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/rentals", require("./routes/rentals"));
app.use("/api/users", require("./routes/users"));
app.use("/api/logins", require("./routes/logins"));

app.get("/", (req, res) => {
  res.send("Vidly");
});

// global error handler middleware
app.use(require("./middleware/error"));

module.exports = app;
