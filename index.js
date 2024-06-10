const express = require("express");
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect("mongodb://localhost:27017/vidly");
  console.log("Connected to MongoDB...");

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

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
