const express = require("express");
const router = express.Router();

const {
  workoutStats,
  todayWorkout,
  postUserWorkout,
  postWorkouts,
  updateWorkoutStatus,
  getWorkouts,
  getWorkoutHistory,
  deleteWorkout,
  updateWorkout,
  addExerciseToWorkout,
  completeExercise,
} = require("../controllers/workoutController");

const {
  validateWorkout,
  validateWorkoutInput,
  validateWorkoutUpdate,
  validateExerciseAssignment,
  validateUpdateWorkoutStatus,
} = require("../middlewares/validationArrays");
const verifyToken = require("../middlewares/verifyToken");
const { asyncWrapper } = require("../middlewares/wrapper");
const { validator } = require("../middlewares/validation");
const allowedTo = require("../middlewares/allowedTo");

router
  .route("/")
  .get(verifyToken, asyncWrapper(getWorkouts))
  .post(
    verifyToken,
    allowedTo("ADMIN"),
    validateWorkoutInput,
    validator,
    asyncWrapper(postWorkouts)
  );

router.get("/stats", verifyToken, asyncWrapper(workoutStats));
router.get("/today", verifyToken, asyncWrapper(todayWorkout));

router.get("/history", verifyToken, asyncWrapper(getWorkoutHistory));

router
  .route("/user")
  .post(verifyToken, validateWorkout, validator, asyncWrapper(postUserWorkout));

router.put(
  "/:workoutId/status",
  verifyToken,
  validateUpdateWorkoutStatus,
  validator,
  asyncWrapper(updateWorkoutStatus)
);

router
  .route("/:workoutId")
  .all(verifyToken, allowedTo("ADMIN"))
  .put(validateWorkoutUpdate, validator, asyncWrapper(updateWorkout))
  .delete(asyncWrapper(deleteWorkout));

router.post(
  "/:workoutId/exercises",
  verifyToken,
  allowedTo("ADMIN"),
  validateExerciseAssignment,
  validator,
  asyncWrapper(addExerciseToWorkout)
);
router.patch(
  "/:workoutId/exercises/:exerciseId/complete",
  verifyToken,
  asyncWrapper(completeExercise)
);

module.exports = router;
