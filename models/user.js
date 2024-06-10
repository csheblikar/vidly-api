const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    isAdmin: { type: Boolean },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ admin: this.isAdmin }, process.env.JWT_SECRET, {
    subject: this.id,
  });

  return token;
};

const User = mongoose.model("user", userSchema);

module.exports = User;
