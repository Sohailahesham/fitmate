const router = require("express").Router();
const {
  information,
  goals,
  activity,
  getUserById,
  deleteUserById,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const { validator } = require("../middlewares/validation");
const { asyncWrapper } = require("../middlewares/wrapper");
const {
  activityLevelValidationArray,
  informationValidationArray,
  goalsValidationArray,
  userByEmailValidation,
  updateIsDeletedValidation,
  updateUserRoleValidation,
} = require("../middlewares/validationArrays");
const allowedTo = require("../middlewares/allowedTo");
const {
  getUsers,
  deleteUserByEmail,
  updateIsDeleted,
  updateUserRole,
} = require("../controllers/userController");

router.route("/").get(verifyToken, allowedTo("ADMIN"), asyncWrapper(getUsers));

router
  .route("/info")
  .put(
    verifyToken,
    informationValidationArray,
    validator,
    asyncWrapper(information)
  );

router
  .route("/goal")
  .put(verifyToken, goalsValidationArray, validator, asyncWrapper(goals));

router
  .route("/activity")
  .put(
    verifyToken,
    activityLevelValidationArray,
    validator,
    asyncWrapper(activity)
  );

router
  .route("/email/:email")
  .all(verifyToken, allowedTo("ADMIN"), userByEmailValidation, validator)
  .delete(asyncWrapper(deleteUserByEmail));

router
  .route("/:userId")
  .all(verifyToken, allowedTo("ADMIN"))
  .get(asyncWrapper(getUserById))
  .delete(asyncWrapper(deleteUserById));

router
  .route("/:userId/isDeleted")
  .patch(
    verifyToken,
    allowedTo("ADMIN"),
    updateIsDeletedValidation,
    validator,
    asyncWrapper(updateIsDeleted)
  );

router
  .route("/:userId/role")
  .patch(
    verifyToken,
    allowedTo("ADMIN"),
    updateUserRoleValidation,
    validator,
    asyncWrapper(updateUserRole)
  );

module.exports = router;
