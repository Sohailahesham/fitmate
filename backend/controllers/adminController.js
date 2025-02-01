const User = require("../models/userModel");
const appError = require("../utils/appError");

const getUsers = async (req, res, next) => {
  const users = await User.find({});
  if (!users) {
    return next(appError.create("Failed to retrieve users", 500, "error"));
  }
  res.status(200).json({
    status: "success",
    message: "Users retrieved successfully",
    data: users,
  });
};

const getUserByEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    next(appError.create("Email not found", 404, "fail"));
    return;
  }
  res.status(200).json({
    status: "success",
    message: "User retrieved successfully",
    data: user,
  });
};

const deleteUserByEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOneAndDelete({ email });
  if (!user) {
    next(appError.create("Email not found", 404, "fail"));
    return;
  }
  res.status(200).json({
    status: "success",
    message: "User deleted successfully",
    data: user,
  });
};

module.exports = {
  getUsers,
  getUserByEmail,
  deleteUserByEmail,
};
