const express = require("express");
const router = express.Router();
const { functionWrapper, asyncWrapper } = require("../middlewares/wrapper");
const verifyToken = require("../middlewares/verifyToken");

const {
  register,
  refreshAccessToken,
  login,
  confirmMail,
  redirect,
  logout,
  forgetPassword,
  getResetPassword,
  postResetPassword,
} = require("../controllers/authController");

const { validator } = require("../middlewares/validation");
const passport = require("passport");
const { isTokenRevoked } = require("../middlewares/isTokenRevoked");
const {
  registerValidationArray,
  resetPasswordValidationArray,
  loginValidationArray,
  forgetPasswordValidationArray,
} = require("../middlewares/validationArrays");

router
  .route("/register")
  .post(registerValidationArray, validator, asyncWrapper(register));
router.post("/token", functionWrapper(refreshAccessToken));
router
  .route("/login")
  .post(loginValidationArray, validator, asyncWrapper(login));

router.get("/register/confirm/:token", asyncWrapper(confirmMail));

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  asyncWrapper(redirect)
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
    session: false,
  }),
  asyncWrapper(redirect)
);

router
  .route("/resetPassword")
  .post(forgetPasswordValidationArray, validator, asyncWrapper(forgetPassword));

router
  .route("/resetPassword/:token")
  .get(asyncWrapper(getResetPassword))
  .post(
    resetPasswordValidationArray,
    validator,
    asyncWrapper(postResetPassword)
  );

router.post("/logout", verifyToken, isTokenRevoked, asyncWrapper(logout));

module.exports = router;
