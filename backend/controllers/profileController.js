const { v4 } = require("uuid");
const User = require("../models/userModel");
const { sendMail } = require("../services/mailService");
const AppError = require("../utils/appError");
const {
  calculateBMI,
  getWorkoutsPerWeek,
  getGoalProgress,
  getWeeklyCalorieAverage,
} = require("../utils/healthStatistics");

const profile = async (req, res, next) => {
  const user = await User.findById(req.user.id).select(
    "username email avatarUrl role info goal activityLevel createdAt"
  );
  if (!user || user.isDeleted) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "User profile retrieved successfully",
    data: { user },
  });
};

const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { username, goal, activityLevel, targetWorkouts } = req.body;

  const user = await User.findById(userId).select(
    "username email role info goal activityLevel createdAt"
  );
  if (!user || user.isDeleted)
    return res.status(404).json({ message: "User not found" });

  user.username = username ?? user.username;
  user.goal = goal ?? user.goal;
  user.activityLevel = activityLevel ?? user.activityLevel;

  // If goal is being updated as an object
  if (
    typeof goal === "object" &&
    goal.goal &&
    goal.targetWorkouts !== undefined
  ) {
    user.goal = {
      goal: goal.goal,
      targetWorkouts: goal.targetWorkouts,
    };
  }

  if (targetWorkouts !== undefined) {
    if (typeof user.goal === "object") {
      user.goal.targetWorkouts = targetWorkouts;
    } else {
      user.goal = { goal: user.goal, targetWorkouts };
    }
  }

  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return next(AppError.create("Username already exists", 400, "FAIL"));
    }
    user.username = username;
  }
  if (goal) {
    user.goal = goal;
  }
  if (activityLevel) {
    user.activityLevel = activityLevel;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    message: "User profile updated successfully",
    data: user,
  });
};

const getHealthStats = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || user.isDeleted) {
    return next(AppError.create("User not found", 404, "FAIL"));
  }

  const { weight, height } = user.info;

  const bmi = calculateBMI(weight, height);
  const dailyCalories = await getWeeklyCalorieAverage(user._id);
  const workoutsPerWeek = await getWorkoutsPerWeek(user);
  const goalProgress = await getGoalProgress(user);

  res.json({
    status: "success",
    message: "Health status retrieved successfully",
    data: {
      bmi,
      dailyCalories,
      workoutsPerWeek,
      goalProgress,
    },
  });
};

const updateAvatar = async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    return next(AppError.create("User not found", 404, "FAIL"));
  }

  if (!req.file) {
    return next(AppError.create("No file uploaded", 400, "FAIL"));
  }
  // Assuming req.file.path contains the URL of the uploaded avatar
  user.avatarUrl = req.file.path; // Use the path from the uploaded file
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Avatar updated successfully",
    data: { avatar: user.avatarUrl },
  });
};

module.exports = {
  profile,
  updateProfile,
  getHealthStats,
  updateAvatar,
};
