const {
  getAllExercises,
  getExerciseById,
  getPopularExercises,
  addExercise,
  updateExercise,
  deleteExercise,
} = require("../controllers/exerciseController");
const upload = require("../middlewares/upload");
const allowedTo = require("../middlewares/allowedTo");
const {
  exerciseValidation,
  updateExerciseValidation,
} = require("../middlewares/validationArrays");
const verifyToken = require("../middlewares/verifyToken");
const { asyncWrapper } = require("../middlewares/wrapper");
const { validator } = require("../middlewares/validation");
const router = require("express").Router();

router
  .route("/")
  .get(asyncWrapper(getAllExercises))
  .post(
    verifyToken,
    allowedTo("ADMIN"),
    upload.single("media"),
    exerciseValidation,
    validator,
    asyncWrapper(addExercise)
  );

router.get("/popular", asyncWrapper(getPopularExercises));

router
  .route("/:exerciseId")
  .all(verifyToken)
  .get(asyncWrapper(getExerciseById))
  .patch(
    allowedTo("ADMIN"),
    upload.single("media"),
    updateExerciseValidation,
    validator,
    asyncWrapper(updateExercise)
  )
  .delete(allowedTo("ADMIN"), asyncWrapper(deleteExercise));

module.exports = router;
