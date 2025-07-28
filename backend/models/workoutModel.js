const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Exercise Schema
const exerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    primaryMuscles: {
      type: [String],
      required: true,
      enum: ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio"],
    },
    secondaryMuscles: {
      type: [String],
      required: true,
      enum: ["Chest", "Back", "Legs", "Arms", "Shoulders", "Core", "Cardio"],
    },
    duration: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    instructions: {
      type: String,
      required: true,
    },
    equipment: {
      type: [String],
      default: ["none"],
    },
    sets: {
      type: Number,
      required: true,
    },
    reps: {
      type: String,
      required: true,
    },
    rest: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Cardio", "Strength", "Flexibility", "Balance"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: [String],
      default: [],
    },
    mediaUrl: {
      type: String,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // replaces manual createdAt/updatedAt
);

// Day Schema
const daySchema = new Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  exercises: [{ type: Schema.Types.ObjectId, ref: "Exercise" }],
});

// Workout Schema
const workoutSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      unique: true, // Ensure workout names are unique
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    goals: {
      type: [String],
      required: true,
      enum: ["Weight Loss", "Muscle Gain", "Endurance", "Flexibility"],
    },
    frequency: {
      type: String,
      required: true,
      enum: ["3 days/week", "4 days/week", "5 days/week", "Daily"],
    },
    duration: {
      type: String,
      default: "0 min", // Default value
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },
    benefits: {
      type: [String],
      required: true,
      enum: [
        "Improved Strength",
        "Increased Endurance",
        "Enhanced Flexibility",
        "Weight Loss",
        "Muscle Gain",
        "Better Posture",
        "Stress Relief",
      ],
    },
    days: [daySchema],
  },
  { timestamps: true }
);

// Middleware to calculate duration before saving
workoutSchema.pre("save", async function (next) {
  if (this.isModified("days")) {
    try {
      let totalMinutes = 0;

      // Populate exercises if they're not already populated
      const workout = await this.populate("days.exercises");

      // Calculate duration for each day
      for (const day of workout.days) {
        for (const exercise of day.exercises) {
          // Parse exercise duration (assuming format like "30 min" or "45 min")
          const exerciseMinutes = parseInt(exercise.duration) || 0;
          totalMinutes += exerciseMinutes;
        }
      }

      // Format the total duration
      this.duration = totalMinutes > 0 ? `${totalMinutes} min` : "0 min";
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Middleware to calculate duration after exercises are added/removed
workoutSchema.methods.calculateDuration = async function () {
  try {
    const workout = await this.populate("days.exercises");
    let totalMinutes = 0;

    for (const day of workout.days) {
      for (const exercise of day.exercises) {
        const exerciseMinutes = parseInt(exercise.duration) || 0;
        totalMinutes += exerciseMinutes;
      }
    }

    this.duration = totalMinutes > 0 ? `${totalMinutes} min` : "0 min";
    await this.save();
    return this.duration;
  } catch (err) {
    throw err;
  }
};

const Workout = mongoose.model("Workout", workoutSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = {
  Workout,
  Exercise,
};
