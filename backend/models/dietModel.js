// models/diet.model.js
const mongoose = require("mongoose");

const dietEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String, // format: "YYYY-MM-DD"
      required: true,
    },
    meals: [
      {
        name: String,
        calories: Number,
        macros: {
          protein: Number,
          carbs: Number,
          fat: Number,
        },
        time: String, // Optional: "08:30 AM"
      },
    ],
    totalCalories: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Diet", dietEntrySchema);
