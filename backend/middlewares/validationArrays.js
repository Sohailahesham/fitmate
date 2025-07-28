const { body, param, query, check } = require("express-validator");
const User = require("../models/userModel");

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

const updateEmailValidationArray = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value });
      if (user && user._id.toString() !== req.user.id) {
        throw new Error("Email already in use");
      }
      return true;
    })
    .withMessage("Email already in use"),
];

// Information validation for user profile
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
  body("targetWeight")
    .isNumeric()
    .withMessage("targetWeight must be a number")
    .notEmpty()
    .withMessage("targetWeight is required")
    .isFloat({ min: 30 }, { max: 300 })
    .withMessage("targetWeight can not be less than 30 or greater than 300 kg"),
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

// admin validation
const validateGetUsers = [
  query("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
];

const userByEmailValidation = [
  param("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
];

const updateIsDeletedValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
  body("isDeleted")
    .notEmpty()
    .withMessage("isDeleted status is required")
    .isBoolean()
    .withMessage("isDeleted must be a boolean value"),
];

const updateUserRoleValidation = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid User ID format"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["ADMIN", "SUBSCRIBER"])
    .withMessage("Role must be either ADMIN or SUBSCRIBER"),
];

// Profile update validation
const updateProfileValidation = [
  body("username")
    .optional() // Username is optional for update
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .matches(/^[A-Za-z0-9\s]+$/)
    .withMessage("Username can only contain letters, numbers, and spaces"),
  body("goal")
    .optional() // Goal is optional for update
    .isIn([
      "cardio",
      "diet",
      "bulk fast",
      "clean bulk",
      "maintain weight cutting",
      "maintain weight keep",
    ])
    .withMessage("Invalid Goal"),
  body("activityLevel")
    .optional() // Activity level is optional for update
    .isIn(["none", "light", "moderate", "intense", "extreme"])
    .withMessage("Invalid activityLevel"),
  body("targetWorkouts")
    .optional() // Target workouts is optional for update
    .isInt({ min: 1 })
    .withMessage("Target workouts must be a positive integer"),
];

const allowedMuscles = [
  "Chest",
  "Back",
  "Legs",
  "Arms",
  "Shoulders",
  "Core",
  "Cardio",
];
const allowedCategories = ["Cardio", "Strength", "Flexibility", "Balance"];
const allowedDifficulties = ["Beginner", "Intermediate", "Advanced"];

// Exercise validation
const exerciseValidation = [
  body("name").notEmpty().withMessage("Name is required").trim(),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),

  // Handle comma-separated string for primaryMuscles
  body("primaryMuscles")
    .notEmpty()
    .withMessage("Primary muscles are required")
    .custom((value) => {
      const muscles = value.split(",").map((m) => m.trim());
      return muscles.every((m) => allowedMuscles.includes(m));
    })
    .withMessage(`Primary muscles must be among: ${allowedMuscles.join(", ")}`),

  body("secondaryMuscles")
    .notEmpty()
    .withMessage("Secondary muscles are required")
    .custom((value) => {
      const muscles = value.split(",").map((m) => m.trim());
      return muscles.every((m) => allowedMuscles.includes(m));
    })
    .withMessage(
      `Secondary muscles must be among: ${allowedMuscles.join(", ")}`
    ),

  body("equipment")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const items = value.split(",").map((e) => e.trim());
      return items.every((e) => typeof e === "string");
    })
    .withMessage("Equipment must be a comma-separated string list"),

  body("duration").notEmpty().withMessage("Duration is required"),

  body("difficulty")
    .notEmpty()
    .withMessage("Difficulty is required")
    .isIn(allowedDifficulties)
    .withMessage(
      `Difficulty must be one of: ${allowedDifficulties.join(", ")}`
    ),

  body("instructions").notEmpty().withMessage("Instructions are required"),

  body("sets")
    .notEmpty()
    .withMessage("Sets is required")
    .isInt({ min: 1 })
    .withMessage("Sets must be a number >= 1"),

  body("reps")
    .notEmpty()
    .withMessage("Reps are required")
    .isString()
    .withMessage("Reps must be a string"),

  body("rest")
    .notEmpty()
    .withMessage("Rest time is required")
    .isString()
    .withMessage("Rest must be a string"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(", ")}`),
];

const updateExerciseValidation = [
  param("exerciseId")
    .notEmpty()
    .withMessage("Exercise ID is required")
    .isMongoId()
    .withMessage("Invalid Exercise ID format"),
  body("name").optional().notEmpty().withMessage("Name is required").trim(),
  body("description")
    .optional()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("primaryMuscles")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const muscles = value.split(",").map((m) => m.trim());
      return muscles.every((m) => allowedMuscles.includes(m));
    })
    .withMessage(`Primary muscles must be among: ${allowedMuscles.join(", ")}`),
  body("secondaryMuscles")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const muscles = value.split(",").map((m) => m.trim());
      return muscles.every((m) => allowedMuscles.includes(m));
    })
    .withMessage(
      `Secondary muscles must be among: ${allowedMuscles.join(", ")}`
    ),
  body("equipment")
    .optional()
    .custom((value) => {
      if (!value) return true;
      const items = value.split(",").map((e) => e.trim());
      return items.every((e) => typeof e === "string");
    })
    .withMessage("Equipment must be a comma-separated string list"),
  body("duration").optional(),
  body("difficulty")
    .optional()
    .isIn(allowedDifficulties)
    .withMessage(
      `Difficulty must be one of: ${allowedDifficulties.join(", ")}`
    ),
  body("instructions").optional(),
  body("sets")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Sets must be a number >= 1"),
  body("reps").optional().isString().withMessage("Reps must be a string"),
  body("rest").optional().isString().withMessage("Rest must be a string"),
  body("category")
    .optional()
    .isIn(allowedCategories)
    .withMessage(`Category must be one of: ${allowedCategories.join(", ")}`),
];

// Workout validation
const validateWorkout = [
  check("workoutId")
    .notEmpty()
    .withMessage("Workout ID is required")
    .isMongoId()
    .withMessage("Workout ID must be a valid MongoDB ObjectId"),
];

const validateWorkoutInput = [
  check("name").notEmpty().withMessage("Name is required"),

  check("description").notEmpty().withMessage("Description is required"),

  check("goals")
    .isArray({ min: 1 })
    .withMessage("Goals must be a non-empty array"),

  check("rating").optional().isNumeric().withMessage("Rating must be a number"),

  check("duration")
    .optional()
    .isString()
    .withMessage("Duration must be a string"),

  check("difficulty")
    .notEmpty()
    .withMessage("Difficulty is required")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid difficulty level"),

  check("benefits")
    .isArray({ min: 1 })
    .withMessage("Benefits must be a non-empty array")
    .custom((benefits) => {
      const allowed = [
        "Improved Strength",
        "Increased Endurance",
        "Enhanced Flexibility",
        "Weight Loss",
        "Muscle Gain",
        "Better Posture",
        "Stress Relief",
      ];
      return benefits.every((b) => allowed.includes(b));
    })
    .withMessage("Invalid benefit(s) provided"),

  check("days").isArray().withMessage("Days must be an array"),
];

const validateUpdateWorkoutStatus = [
  [
    param("workoutId")
      .exists()
      .withMessage("workout ID is required")
      .isMongoId()
      .withMessage("workout must be a valid MongoDB ObjectId"),
    body("completionStatus")
      .exists()
      .withMessage("completionStatus is required")
      .isIn(["active", "completed", "paused"])
      .withMessage(
        "completionStatus must be one of: active, completed, paused"
      ),
  ],
];

const validateWorkoutUpdate = [
  param("workoutId")
    .exists()
    .withMessage("workout ID is required")
    .isMongoId()
    .withMessage("workout must be a valid MongoDB ObjectId"),
  body("name").optional().isString().withMessage("name must be a string"),

  body("description")
    .optional()
    .isString()
    .withMessage("description must be a string")
    .isLength({ min: 10 })
    .withMessage("description must be at least 10 characters"),

  body("goals").optional().isArray().withMessage("goals must be an array"),

  body("frequency")
    .optional()
    .isString()
    .withMessage("frequency must be a string"),

  body("duration")
    .optional()
    .isString()
    .withMessage("duration must be a string"),

  body("difficulty")
    .optional()
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("difficulty must be one of: Beginner, Intermediate, Advanced"),

  body("benefits")
    .optional()
    .isArray()
    .withMessage("benefits must be an array")
    .custom((arr) => {
      const allowed = [
        "Improved Strength",
        "Increased Endurance",
        "Enhanced Flexibility",
        "Weight Loss",
        "Muscle Gain",
        "Better Posture",
        "Stress Relief",
      ];
      return arr.every((item) => allowed.includes(item));
    })
    .withMessage("benefits must only include valid values"),
];

// Validate exercise assignment to a workout
const validateExerciseAssignment = [
  param("workoutId")
    .exists()
    .withMessage("workoutId is required")
    .isMongoId()
    .withMessage("workoutId must be a valid MongoDB ObjectId"),
  body("exerciseId")
    .exists()
    .withMessage("exerciseId is required")
    .isMongoId()
    .withMessage("exerciseId must be a valid MongoDB ObjectId"),

  body("day")
    .exists()
    .withMessage("day is required")
    .isIn([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ])
    .withMessage("day must be a valid weekday"),
];

//
const idValidation = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("Invalid ID format"),
];

// const workoutValidation = [
//   body("name")
//     .notEmpty()
//     .withMessage("Name is required")
//     .isString()
//     .withMessage("Name must be a string"),
//   body("description")
//     .notEmpty()
//     .withMessage("Description is required")
//     .isString()
//     .withMessage("Description must be a string"),
//   body("goals")
//     .notEmpty()
//     .withMessage("Goals are required")
//     .isArray({ min: 1 })
//     .withMessage("Goals must be a non-empty array"),
//   body("frequency")
//     .notEmpty()
//     .withMessage("Frequency is required")
//     .isString()
//     .withMessage("Frequency must be a string"),
//   body("duration")
//     .notEmpty()
//     .withMessage("Duration is required")
//     .isString()
//     .withMessage("Duration must be a string"),
//   body("difficulty")
//     .notEmpty()
//     .withMessage("Difficulty is required")
//     .isIn(["Beginner", "Intermediate", "Advanced"])
//     .withMessage(
//       "Difficulty must be one of: Beginner, Intermediate, Advanced"
//     ),
//   body("benefits")
//     .notEmpty()
//     .withMessage("Benefits are required")
//     .isArray({ min: 1 })
//     .withMessage("Benefits must be a non-empty array"),
// ];

module.exports = {
  registerValidationArray,
  resetPasswordValidationArray,
  loginValidationArray,
  forgetPasswordValidationArray,
  informationValidationArray,
  goalsValidationArray,
  activityLevelValidationArray,
  userByEmailValidation,
  // workoutValidation,
  idValidation,
  exerciseValidation,
  updateExerciseValidation,
  validateWorkout,
  validateWorkoutInput,
  validateUpdateWorkoutStatus,
  validateWorkoutUpdate,
  validateExerciseAssignment,
  updateProfileValidation,
  updateEmailValidationArray,
  updateIsDeletedValidation,
  updateUserRoleValidation,
  validateGetUsers,
};
