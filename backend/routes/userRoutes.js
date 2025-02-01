const router = require("express").Router();
const {
  information,
  goals,
  activity,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const { validator } = require("../middlewares/validation");
const isConfirmed = require("../middlewares/isConfirmed");
const { asyncWrapper, functionWrapper } = require("../middlewares/wrapper");
const {
  activityLevelValidationArray,
  informationValidationArray,
  goalsValidationArray,
} = require("../middlewares/validationArrays");

router
  .route("/info")
  .put(
    verifyToken,
    isConfirmed,
    informationValidationArray,
    validator,
    asyncWrapper(information)
  );

router
  .route("/goal")
  .put(
    verifyToken,
    isConfirmed,
    goalsValidationArray,
    validator,
    asyncWrapper(goals)
  );

router
  .route("/activity")
  .put(
    verifyToken,
    isConfirmed,
    activityLevelValidationArray,
    validator,
    asyncWrapper(activity)
  );

module.exports = router;
