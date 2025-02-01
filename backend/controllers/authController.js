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
const { revokeAccessToken } = require("../utils/blackList");

const register = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;
  const existingUser = await User.findOne({ email });
  // console.log(existingUser);
  if (existingUser) {
    const error = AppError.create("User already exists", 409, "Fail");
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const registerationToken = v4();

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    registerationToken,
  });

  await newUser.save();

  const output = `<p>Hi <strong>${newUser.username}</strong>,</p> 
    <p>Thank you for registering with <strong>[Fit Mate]</strong>.</p> 
    <p>Please use the following link to complete your registration:</p> 
    <p style="font-size: 18px; color: blue;"> 
        <a href="http://localhost:3000/api/auth/register/confirm/${newUser.registerationToken}" target="_blank">
            Complete Registration
        </a>
    </p> 
    <p>If you did not request this, please ignore this email.</p> 
    <p>Best regards,<br>Fit Mate</p>`;

  await sendMail(newUser, output);

  res.status(201).json({
    status: "success",
    message: "Please confirm your email",
    data: { user: newUser },
  }); // created successfuly
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
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
  if (!user) {
    const error = AppError.create("Email Not found", 404, "Fail");
    return next(error);
  }
  const token = v4();
  user.resetPasswordToken = token;
  await user.save();
  const output = `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center;">
            <h1>Password Reset Request</h1>
        </div>
        <div style="margin-top: 20px;">
            <p>Hi ${user.username},</p>
            <p>We received a request to reset your password. Click the button below to reset your password:</p>
            <a href="http://localhost:3000/api/auth/resetPassword/${user.resetPasswordToken}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Reset Password</a>
            <p>If you did not request a password reset, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #777777;">
            <p>&copy; 2025 FitMate. All rights reserved.</p>
        </div>
    </div>
`;
  await sendMail(user, output);
  res.status(200).json({
    status: "Success",
    message: "Password Reset Email sent. Please Check Your Inbox",
    data: null,
  });
};

const getResetPassword = (req, res, next) => {
  const token = req.params.token;
  const user = User.findOne({ resetPasswordToken: token });
  if (!user) {
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
  res.status(200).json({
    status: "succeess",
    message: "Your Password has been reset successfully",
    data: null,
  });
};

const confirmMail = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({ registerationToken: token });
  if (!user) {
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
  user.registerationToken = "";
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

const logout = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    const error = AppError.create("User not found", 404, "FAIL");
    return next(error);
  }
  user.refreshToken = "";
  await user.save();
  req.user = null;
  revokeAccessToken(req.headers.authorization.split(" ")[1]);

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
    data: null,
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
};
