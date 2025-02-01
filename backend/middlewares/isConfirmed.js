const appError = require("../utils/appError");

module.exports = (req, res, next) => {
  console.log(req.user);
  if (!req.user.isConfirmed) {
    next(appError.create("Email is not confirmed", 403, "fail"));
    return;
  }
  next();
};
