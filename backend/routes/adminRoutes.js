const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserByEmail,
  deleteUserByEmail,
} = require("../controllers/adminController");

const { asyncWrapper } = require("../middlewares/wrapper");
const { validator } = require("../middlewares/validation");
const verifyToken = require("../middlewares/verifyToken");
const { isTokenRevoked } = require("../middlewares/isTokenRevoked");
const { userByEmailValidation } = require("../middlewares/validationArrays");

const allowedTo = require("../middlewares/allowedTo");

router
  .route("/users")
  .get(verifyToken, isTokenRevoked, allowedTo("ADMIN"), asyncWrapper(getUsers));

router
  .route("/user")
  .all(
    verifyToken,
    isTokenRevoked,
    userByEmailValidation,
    validator,
    allowedTo("ADMIN")
  )
  .get(asyncWrapper(getUserByEmail))
  .delete(asyncWrapper(deleteUserByEmail));

module.exports = router;
