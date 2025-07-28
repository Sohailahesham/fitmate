// const User = require("../models/userModel");
// const { Workout, Exercise } = require("../models/workoutModel");
// const mongoose = require("mongoose");
// const appError = require("../utils/appError");

// const getUsers = async (req, res, next) => {
//   cons
//   const users = await User.find({});
//   if (!users) {
//     return next(appError.create("Failed to retrieve users", 500, "error"));
//   }
//   res.status(200).json({
//     status: "success",
//     message: "Users retrieved successfully",
//     data: users,
//   });
// };

// const getUserByEmail = async (req, res, next) => {
//   const { email } = req.query;
//   const user = await User.findOne({ email });
//   if (!user) {
//     next(appError.create("Email not found", 404, "fail"));
//     return;
//   }
//   res.status(200).json({
//     status: "success",
//     message: "User retrieved successfully",
//     data: user,
//   });
// };

// const deleteUserByEmail = async (req, res, next) => {
//   const { email } = req.query;
//   const user = await User.findOne({ email });
//   if (!user) {
//     next(appError.create("Email not found", 404, "fail"));
//     return;
//   }
//   if (user.role === "ADMIN" && user._id !== req.user.id) {
//     return next(appError.create("Cannot delete an admin user", 403, "fail"));
//   }
//   user.deleteOne();

//   res.status(200).json({
//     status: "success",
//     message: "User deleted successfully",
//     data: user,
//   });
// };

// const updateIsDeleted = async (req, res, next) => {
//   const { userId } = req.params;
//   let { isDeleted } = req.body;

//   isDeleted = isDeleted === "true" ? true : false;

//   const user = await User.findById(userId);
//   if (!user) return next(appError.create("User not found", 404, "fail"));

//   user.isDeleted = isDeleted;
//   user.deletedAt = isDeleted === true ? new Date() : null;
//   await user.save(); // ✅ now Mongoose tracks the change

//   res.status(200).json({
//     status: "success",
//     message: `User ${isDeleted ? "soft-deleted" : "restored"} successfully`,
//     data: user,
//   });
// };

// const updateUserRole = async (req, res, next) => {
//   const { userId } = req.params;
//   const { role } = req.body;

//   if (!["ADMIN", "SUBSCRIBER"].includes(role)) {
//     return next(appError.create("Invalid role specified", 400, "fail"));
//   }

//   const user = await User.findById(userId);
//   if (!user) {
//     return next(appError.create("User not found", 404, "fail"));
//   }
//   if (user.role === "ADMIN" && user._id.toString() !== req.user.id) {
//     return next(
//       appError.create("Cannot change role of an admin user", 403, "fail")
//     );
//   }
//   user.role = role;
//   await user.save();

//   res.status(200).json({
//     status: "success",
//     message: `User role updated to ${role} successfully`,
//     data: user,
//   });
// };

// // const createWorkout = async (req, res, next) => {
// //   const { name, days } = req.body;

// //   if (!name || !days) {
// //     return next(
// //       new appError("Please provide a name and days for the workout", 400)
// //     );
// //   }

// //   const workout = new Workout({
// //     name,
// //     days,
// //   });
// //   await workout.save();
// //   if (!workout) {
// //     return next(new appError("Failed to create workout", 500));
// //   }

// //   res.status(201).json({
// //     status: "success",
// //     data: {
// //       workout,
// //     },
// //   });
// // };

// module.exports = {
//   getUsers,
//   getUserByEmail,
//   deleteUserByEmail,
//   updateIsDeleted,
//   updateUserRole,
//   // createWorkout,
// };
