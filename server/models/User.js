const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  refresh_token: {
    type: String,
    default: "",
  },
  token_version: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("User", userSchema);
