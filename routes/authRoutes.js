const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const asyncWrapper = require("../middlewares/asyncWrapper");

const {
  register,
  refreshAccessToken,
  login,
} = require("../controllers/authController");

const { body } = require("express-validator");
const { validator } = require("../middlewares/validation");

router.route("/register").post(
  [
    body("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Username can only contain letters and numbers"),
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email"),
    body("password")
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/\d/)
      .withMessage("Password must contain at least one number")
      .matches(/[@$!%*?&_]/)
      .withMessage(
        "Password must contain at least one special character (@, $, !, %, *, ?, &, _)"
      )
      .not()
      .matches(/\s/)
      .withMessage("Password must not contain spaces"),
  ],
  validator,
  asyncWrapper(register)
);
router.post("/token", asyncWrapper(refreshAccessToken));
router
  .route("/login")
  .post(
    [
      body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Must be a valid email"),
      body("password").notEmpty().withMessage("password is required"),
    ],
    validator,
    asyncWrapper(login)
  );

module.exports = router;
