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
  updateEmail,
  deleteAccount,
} = require("../controllers/authController");

const { validator } = require("../middlewares/validation");
const passport = require("passport");
const {
  registerValidationArray,
  resetPasswordValidationArray,
  loginValidationArray,
  forgetPasswordValidationArray,
  updateEmailValidationArray,
} = require("../middlewares/validationArrays");
const { loginLimiter } = require("../middlewares/rateLimit");

router
  .route("/register")
  .post(registerValidationArray, validator, asyncWrapper(register));
router.post("/token", functionWrapper(refreshAccessToken));
router
  .route("/login")
  .post(loginValidationArray, validator, loginLimiter, asyncWrapper(login));

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

router.patch(
  "/email",
  verifyToken,
  updateEmailValidationArray,
  validator,
  asyncWrapper(updateEmail)
);
router.get("/verify-email/:token", asyncWrapper(confirmMail));

router.post("/logout", verifyToken, asyncWrapper(logout));

router.patch("/account", verifyToken, asyncWrapper(deleteAccount));

module.exports = router;
