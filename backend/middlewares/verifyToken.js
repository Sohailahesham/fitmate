require("dotenv").config();
const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");
const cacheService = require("../services/redis");
const User = require("../models/userModel");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return next(appError.create("Authorization header missing", 401, "fail"));
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next(appError.create("No token provided", 401, "fail"));
    }

    const isBlacklisted = await cacheService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      return next(appError.create("Token is blacklisted", 401, "fail"));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, async (err, decoded) => {
      if (err) {
        return next(appError.create("Invalid token", 403, "fail"));
      }

      const fullUser = await User.findById(decoded.id);
      if (!fullUser) {
        return next(appError.create("User not found", 404, "fail"));
      }

      if (fullUser.isDeleted) {
        return next(appError.create("Account is deleted", 403, "fail"));
      }

      if (!fullUser.isConfirmed) {
        return next(appError.create("Email is not confirmed", 403, "fail"));
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    next(appError.create("Token verification failed", 500, "error"));
  }
};

module.exports = verifyToken;
