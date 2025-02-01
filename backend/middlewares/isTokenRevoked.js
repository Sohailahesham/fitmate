const appError = require("../utils/appError");
const { blackList } = require("../utils/blackList");

const isTokenRevoked = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (blackList.has(token)) {
    const error = appError.create("Token has been revoked", 401, "FAIL");
    return next(error);
  }
  next();
};

module.exports = {
  isTokenRevoked,
};
