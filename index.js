require("dotenv").config();

const app = require("./app");
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB...`);

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Listening on port ${port}...`));
})();
