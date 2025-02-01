const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const informationSchema = new Schema({
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  birthDate: {
    type: Date,
  },
  foodDislikes: {
    type: [String],
    default: [],
  },
  trainRate: {
    type: String,
    enum: ["none", "light", "moderate", "intense", "extreme"],
  },
  budget: {
    type: String,
    enum: ["low", "medium", "high"],
  },
  trainingPlace: {
    type: String,
    enum: ["home", "gym", "none"],
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  refreshToken: {
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
  registerationToken: {
    type: String,
    required: false,
  },
  isConfirmed: {
    type: Boolean,
    required: false,
    default: false,
  },
  role: {
    type: String,
    enum: ["ADMIN", "SUBSCRIBER"],
    default: "SUBSCRIBER",
  },
  resetPasswordToken: {
    type: String,
  },
  info: informationSchema,
  goal: {
    type: String,
    enum: [
      "cardio",
      "diet",
      "bulk fast",
      "clean bulk",
      "maintain weight cutting",
      "maintain weight keep",
    ],
  },
  activityLevel: {
    type: String,
    enum: ["none", "light", "moderate", "intense", "extreme"],
  },
});

module.exports = mongoose.model("User", userSchema);
