const jwt = require("jsonwebtoken");
const appError = require("../utils/appError");

const verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["Authorization"] || req.headers["authorization"];

  if (!authHeader) {
    const error = appError.create(
      "Unauthorized: token is missing",
      401,
      "Fail"
    );
    return next(error);
  }
  const token = authHeader.split(" ")[1];
  try {
    const currentUser = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    req.user = currentUser;
    next();
  } catch (err) {
    const error = appError.create("forbidden: invalid token", 403, "Fail");
    return next(error);
  }
};

module.exports = verifyToken;
