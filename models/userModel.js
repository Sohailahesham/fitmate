const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  registerationToken: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    required: false,
  },
  facebookId: {
    type: String,
    required: false,
  },
  isConfirmed: {
    type: Boolean,
    required: false,
    default: false,
  },
  refreshToken: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("User", userSchema);
