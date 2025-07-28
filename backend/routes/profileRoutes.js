const router = require("express").Router();

const {
  profile,
  updateProfile,
  getHealthStats,
  updateAvatar,
} = require("../controllers/profileController");
const verifyToken = require("../middlewares/verifyToken");
const { validator } = require("../middlewares/validation");
const { asyncWrapper } = require("../middlewares/wrapper");
const { updateProfileValidation } = require("../middlewares/validationArrays");
const uploadAvatar = require("../middlewares/uploadAvatar");

router
  .route("/")
  .all(verifyToken)
  .get(asyncWrapper(profile))
  .put(updateProfileValidation, validator, asyncWrapper(updateProfile));

router.get("/stats", verifyToken, getHealthStats);

router
  .route("/avatar")
  .put(verifyToken, uploadAvatar.single("avatar"), asyncWrapper(updateAvatar));

module.exports = router;
