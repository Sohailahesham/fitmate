const { body } = require("express-validator");

const registerValidationArray = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[A-Za-z0-9\s]+$/)
    .withMessage("Username can only contain letters, numbers, and spaces"),
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
  body("confirmPassword")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const loginValidationArray = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
  body("password").notEmpty().withMessage("password is required"),
];

const forgetPasswordValidationArray = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
];

const resetPasswordValidationArray = [
  body("newPassword")
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
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const informationValidationArray = [
  body("weight")
    .isNumeric()
    .withMessage("Weight must be a number")
    .notEmpty()
    .withMessage("Weight is required")
    .isFloat({ min: 30 }, { max: 300 })
    .withMessage("Weight can not be less than 30 or greater than 300 kg"),
  body("height")
    .isNumeric()
    .withMessage("height must be a number")
    .notEmpty()
    .withMessage("height is required")
    .isFloat({ min: 100 }, { max: 250 })
    .withMessage("height can not be less than 100 or greater than 250 cm"),
  body("birthDate")
    .isDate()
    .withMessage("birthDate must be a date")
    .notEmpty()
    .withMessage("birthDate is required")
    .custom((value) => {
      const birthdate = new Date(value);
      const today = new Date();

      // Calculate age
      let age = today.getFullYear() - birthdate.getFullYear();
      const monthDiff = today.getMonth() - birthdate.getMonth();

      // Adjust age if birthday hasn't occurred yet this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthdate.getDate())
      ) {
        age--;
      }

      if (age < 10 || age > 120) {
        throw new Error("Age must be between 10 and 120 years");
      }

      return true;
    }),
  body("foodDislikes")
    .optional()
    .isArray()
    .withMessage("food Dislikes must be an array"),
  body("trainRate")
    .isIn(["none", "light", "moderate", "intense", "extreme"])
    .withMessage(
      "Training Rate must be within [none, light, moderate, intense, extreme]"
    )
    .notEmpty()
    .withMessage("Training Rate is required"),
  body("budget")
    .isIn(["low", "medium", "high"])
    .withMessage("Budget must be one of low, medium and high")
    .notEmpty()
    .withMessage("Budget is required"),
  body("trainingPlace")
    .isIn(["home", "gym", "none"])
    .withMessage("Training place must be one of home, gym and none")
    .notEmpty()
    .withMessage("Training place is required"),
];

const goalsValidationArray = [
  body("goal")
    .isIn([
      "cardio",
      "diet",
      "bulk fast",
      "clean bulk",
      "maintain weight cutting",
      "maintain weight keep",
    ])
    .withMessage("Invalid Goal")
    .notEmpty()
    .withMessage("Goal is required"),
];

const activityLevelValidationArray = [
  body("activityLevel")
    .isIn(["none", "light", "moderate", "intense", "extreme"])
    .withMessage("Invalid activityLevel")
    .notEmpty()
    .withMessage("activityLevel is required"),
];

const userByEmailValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
];

module.exports = {
  registerValidationArray,
  resetPasswordValidationArray,
  loginValidationArray,
  forgetPasswordValidationArray,
  informationValidationArray,
  goalsValidationArray,
  activityLevelValidationArray,
  userByEmailValidation,
};
