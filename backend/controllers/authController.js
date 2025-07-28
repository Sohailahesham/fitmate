const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateJWT");
const { v4 } = require("uuid");
const { sendMail } = require("../services/mailService");
const forgetPasswordEmail = require("../emails/forgetPasswordEmail");
const goodbyeEmail = require("../emails/goodbyeEmail");
const registerEmail = require("../emails/registerEmail");
const confirmUpdateEmail = require("../emails/confirmUpdateEmail");
const casheService = require("../services/redis");

const register = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const existingUser = await User.findOne({ email });
  // console.log(existingUser);
  if (existingUser) {
    const error = AppError.create("User already exists", 409, "Fail");
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = v4();

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    verificationToken,
  });

  await newUser.save();

  const output = registerEmail(newUser.username, newUser.verificationToken);
  await sendMail(newUser, output, "Verification email");

  res.status(201).json({
    status: "success",
    message: "Please confirm your email",
    data: { user: newUser },
  }); // created successfuly
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.isDeleted) {
    const error = AppError.create("Email Not found", 404, "Fail");
    return next(error);
  }
  const passwordIsValid = await bcrypt.compare(password, user.password);
  if (!passwordIsValid) {
    const error = AppError.create("Incorrect Password", 401, "Fail");
    return next(error);
  }
  if (!user.isConfirmed) {
    const error = AppError.create(
      "Your email is not confirmed. Please check your email for the confirmation link.",
      403,
      "Fail"
    );
    return next(error);
  }
  const accessToken = generateAccessToken({
    email: user.email,
    id: user._id,
    isConfirmed: user.isConfirmed,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    email: user.email,
    id: user._id,
    isConfirmed: user.isConfirmed,
    role: user.role,
  });
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User loged in successfully",
    data: { user, accessToken, refreshToken },
  });
};

const refreshAccessToken = (req, res, next) => {
  const { token } = req.body;

  // Check if the token is provided
  if (token === null) {
    const error = AppError.create(
      "Unauthorized: token is missing",
      401,
      "Fail"
    );
    return next(error);
  }

  // Verify the provided refresh token
  jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err, user) => {
    if (err) {
      const error = AppError.create("Forbidden: Invalid Token", 403, "Fail");
      return next(error);
    }

    // Generate a new access token using user details
    const accessToken = generateAccessToken({
      email: user.email,
      id: user._id,
      isConfirmed: user.isConfirmed,
      role: user.role,
    });

    // Respond with the new access token
    res.status(200).json({
      status: "success",
      message: "New access token generated successfully",
      data: { accessToken },
    });
  });
};

const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.isDeleted) {
    const error = AppError.create("Email Not found", 404, "Fail");
    return next(error);
  }
  const token = v4();
  user.resetPasswordToken = token;
  await user.save();
  const output = forgetPasswordEmail(user.username, user.resetPasswordToken);
  await sendMail(user, output, "Reset Password Request");
  res.status(200).json({
    status: "Success",
    message: "Password Reset Email sent. Please Check Your Inbox",
    data: null,
  });
};

const getResetPassword = (req, res, next) => {
  const token = req.params.token;
  const user = User.findOne({ resetPasswordToken: token });
  if (!user || user.isDeleted) {
    const error = AppError.create(
      "Invalid or Expired reset password token",
      400,
      "FAIL"
    );
    return next(error);
  }
  res.status(200).json({
    status: "success",
    message: "Token is valid. Please proceed to reset your password",
    data: null,
  });
};

const postResetPassword = async (req, res, next) => {
  const token = req.params.token;
  const { newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const user = await User.findOneAndUpdate(
    { resetPasswordToken: token },
    { password: hashedPassword, resetPasswordToken: "" },
    { new: true }
  );
  if (!user || user.isDeleted) {
    const error = AppError.create(
      "Invalid or Expired reset password token",
      400,
      "FAIL"
    );
    return next(error);
  }
  user.resetPasswordToken = "";
  await user.save();
  res.status(200).json({
    status: "succeess",
    message: "Your Password has been reset successfully",
    data: null,
  });
};

const confirmMail = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });
  if (!user || user.isDeleted) {
    const error = AppError.create("This token is not correct", 400, "Fail");
    return next(error);
  }

  const accessToken = generateAccessToken({
    email: user.email,
    id: user._id,
    isConfirmed: true,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    email: user.email,
    id: user._id,
    isConfirmed: true,
    role: user.role,
  });
  user.verificationToken = "";
  user.isConfirmed = true;
  user.refreshToken = refreshToken;

  await user.save();

  res.status(201).json({
    status: "success",
    message: "Email is confirmed",
    data: { user, accessToken, refreshToken },
  });
};

const redirect = async (req, res) => {
  const user = await User.findById(req.user._id);
  const accessToken = generateAccessToken({
    email: user.email,
    id: user._id,
    isConfirmed: true,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    email: user.email,
    id: user._id,
    isConfirmed: true,
    role: user.role,
  });
  user.refreshToken = refreshToken;
  user.isConfirmed = true;
  await user.save();
  res.status(200).json({
    status: "Success",
    message: "Authenticated successfully",
    accessToken,
    refreshToken,
  });
};

const updateEmail = async (req, res, next) => {
  const userId = req.user.id;
  const { email } = req.body;

  if (!email) {
    return next(AppError.create("Email is required", 400, "FAIL"));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(AppError.create("User not found", 404, "FAIL"));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser._id.toString() !== userId) {
    return next(AppError.create("Email already exists", 400, "FAIL"));
  }
  if (user.email === email) {
    return next(
      AppError.create("New email is the same as current email", 400, "FAIL")
    );
  }
  user.verificationToken = v4();
  user.isConfirmed = false;
  user.email = email;
  await user.save();
  const output = confirmUpdateEmail(user.username, user.verificationToken);
  await sendMail(user, output, "Email Update Verification");

  res.status(200).json({
    status: "success",
    message: "Verification email sent to new email address",
    data: { email: user.email },
  });
};

const verifyEmail = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    const error = AppError.create(
      "Invalid or expired verification token",
      400,
      "FAIL"
    );
    return next(error);
  }
  user.verificationToken = "";
  user.isConfirmed = true;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
    data: { user },
  });
};

const logout = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(AppError.create("No token provided", 401, "fail"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  } catch (err) {
    return next(AppError.create("Invalid token", 403, "fail"));
  }

  await casheService.blacklistToken(token, decoded.exp);
  req.user = undefined;

  res.status(200).json({
    status: "success",
    message: "User logged out successfully",
  });
};

const deleteAccount = async (req, res, next) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return next(AppError.create("Password is required", 400, "fail"));
  }

  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    return next(AppError.create("User not found", 404, "fail"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(AppError.create("Incorrect password", 401, "fail"));
  }

  // Soft delete
  user.isDeleted = true;
  user.deletedAt = new Date();

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(AppError.create("No token provided", 401, "fail"));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  } catch (err) {
    return next(AppError.create("Invalid token", 403, "fail"));
  }

  await casheService.blacklistToken(token, decoded.exp);
  // Clear the refresh token from the user
  user.refreshToken = "";
  await user.save();
  req.user = undefined;
  // Send goodbye email
  const emailContent = goodbyeEmail(user.username);
  await sendMail(user, emailContent, "Your FitMate Account Has Been Deleted");

  res.status(200).json({
    status: "success",
    message: "Your account has been deleted. Goodbye!",
  });
};

module.exports = {
  register,
  refreshAccessToken,
  login,
  confirmMail,
  redirect,
  logout,
  forgetPassword,
  getResetPassword,
  postResetPassword,
  updateEmail,
  verifyEmail,
  deleteAccount,
};
