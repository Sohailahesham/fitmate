const rateLimit = require("express-rate-limit");

// General rate limiter (example: 100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 login attempts
  message: "Too many login attempts. Try again after 10 minutes.",
});

module.exports = {
  limiter,
  loginLimiter,
};
