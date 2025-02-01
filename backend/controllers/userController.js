const User = require("../models/userModel");
const AppError = require("../utils/appError");

const information = async (req, res, next) => {
  const info = req.body;
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  user.info = info;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "User information saved successfully",
    data: { info: user.info },
  });
};

const goals = async (req, res, next) => {
  const goal = req.body.goal;
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  user.goal = goal;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "User goal is set successfully",
    data: { goal: user.goal },
  });
};

const activity = async (req, res, next) => {
  const activityLevel = req.body.activityLevel;
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  user.activityLevel = activityLevel;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "User activity level is set successfully",
    data: { activityLevel: user.activityLevel },
  });
};

module.exports = {
  information,
  goals,
  activity,
};
