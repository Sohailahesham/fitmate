const { validationResult } = require("express-validator");
const appError = require("../utils/appError");
const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, "fail");
    return next(error);
  }
  next();
};

module.exports = { validator };
