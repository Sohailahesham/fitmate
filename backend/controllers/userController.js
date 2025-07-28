const User = require("../models/userModel");
const appError = require("../utils/appError");
const paginate = require("../utils/pagination");
const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  const { page, limit, skip } = paginate(req.query);

  const email = req.query.email;
  const userFilter = email ? { email } : {};

  const [users, totalUsers] = await Promise.all([
    User.find(userFilter)
      .select("-password -__v")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(userFilter),
  ]);

  if (users.length === 0) {
    return next(appError.create("Failed to retrieve users", 500, "error"));
  }

  res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    totalUsers,
    page: page,
    limit: limit,
    hasMore: totalUsers > skip + limit,
    totalPages: Math.ceil(totalUsers / limit),
    data: { users },
  });
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(appError.create("Invalid user ID", 400, "fail"));
  }
  const user = await User.findById(userId).select("-password -__v");
  if (!user) {
    return next(appError.create("User not found", 404, "fail"));
  }

  res.status(200).json({
    status: "success",
    message: "User retrieved successfully",
    data: { user },
  });
};

const deleteUserByEmail = async (req, res, next) => {
  const { email } = req.params;
  const user = await User.findOne({ email });
  if (!user) {
    next(appError.create("Email not found", 404, "fail"));
    return;
  }
  if (user.role === "ADMIN") {
    return next(appError.create("Cannot delete an admin user", 403, "fail"));
  }
  user.deleteOne();

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: user,
  });
};

const deleteUserById = async (req, res, next) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return next(appError.create("Invalid user ID", 400, "fail"));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(appError.create("User not found", 404, "fail"));
  }
  if (user.role === "ADMIN") {
    return next(appError.create("Cannot delete an admin user", 403, "fail"));
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: { user },
  });
};

const updateIsDeleted = async (req, res, next) => {
  const { userId } = req.params;
  let { isDeleted } = req.body;

  isDeleted = isDeleted === "true" ? true : false;

  const user = await User.findById(userId);
  if (!user) return next(appError.create("User not found", 404, "fail"));

  user.isDeleted = isDeleted;
  user.deletedAt = isDeleted === true ? new Date() : null;
  await user.save(); // ✅ now Mongoose tracks the change

  res.status(200).json({
    status: "success",
    message: `User ${isDeleted ? "soft-deleted" : "restored"} successfully`,
    data: user,
  });
};

const updateUserRole = async (req, res, next) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["ADMIN", "SUBSCRIBER"].includes(role)) {
    return next(appError.create("Invalid role specified", 400, "fail"));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(appError.create("User not found", 404, "fail"));
  }
  if (user.role === "ADMIN" && user._id.toString() !== req.user.id) {
    return next(
      appError.create("Cannot change role of an admin user", 403, "fail")
    );
  }
  user.role = role;
  await user.save();

  res.status(200).json({
    status: "success",
    message: `User role updated to ${role} successfully`,
    data: user,
  });
};

const information = async (req, res, next) => {
  const info = req.body;
  const user = await User.findById(req.user.id);
  if (!user || user.isDeleted) {
    const error = appError.create("User not found", 404, "FAIL");
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
  if (!user || user.isDeleted) {
    const error = appError.create("User not found", 404, "FAIL");
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
  if (!user || user.isDeleted) {
    const error = appError.create("User not found", 404, "FAIL");
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
  getUsers,
  getUserById,
  deleteUserByEmail,
  updateIsDeleted,
  updateUserRole,
  deleteUserById,
};
