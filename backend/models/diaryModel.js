// models/diary.model.js
const mongoose = require("mongoose");

const diaryEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      default: 0,
    },
    mood: {
      type: String,
      enum: [
        "happy",
        "sad",
        "angry",
        "stressed",
        "calm",
        "neutral",
        "tired",
        "motivated",
      ],
      default: "neutral",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Diary", diaryEntrySchema);
