const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateJWT");
const { validationResult } = require("express-validator");

const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  console.log(existingUser);
  if (existingUser) {
    const error = AppError.create("User already exists", 409, "Fail");
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken({
    email: newUser.email,
    id: newUser._id,
  });
  const refreshToken = generateRefreshToken({
    email: newUser.email,
    id: newUser._id,
  });

  newUser.refreshToken = refreshToken;
  await newUser.save();
  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: { user: newUser, accessToken, refreshToken },
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
  const accessToken = generateAccessToken({
    email: user.email,
    id: user._id,
  });
  const refreshToken = generateRefreshToken({
    email: user.email,
    id: user._id,
  });
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User loged in successfully",
    data: { user, accessToken, refreshToken },
  });
};

const refreshAccessToken = async (req, res, next) => {
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
    });

    // Respond with the new access token
    res.status(200).json({
      status: "success",
      message: "New access token generated successfully",
      data: { accessToken },
    });
  });
};

module.exports = {
  register,
  refreshAccessToken,
  login,
};
