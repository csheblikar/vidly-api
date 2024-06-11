const express = require("express");
const { expressjwt: expressJwt } = require("express-jwt");
const mongoose = require("mongoose");

require("dotenv").config();

(async () => {
  await mongoose.connect("mongodb://localhost:27017/vidly");
  console.log("Connected to MongoDB...");

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

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
})();
