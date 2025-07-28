// const express = require("express");
// const router = express.Router();
// const {
//   getUsers,
//   getUserByEmail,
//   deleteUserByEmail,
//   // createWorkout,
//   updateIsDeleted,
//   updateUserRole,
// } = require("../controllers/adminController");

// const { asyncWrapper } = require("../middlewares/wrapper");
// const { validator } = require("../middlewares/validation");
// const verifyToken = require("../middlewares/verifyToken");
// const {
//   userByEmailValidation,
//   workoutValidation,
//   updateIsDeletedValidation,
//   updateUserRoleValidation,
// } = require("../middlewares/validationArrays");

// const allowedTo = require("../middlewares/allowedTo");

// router
//   .route("/users")
//   .get(verifyToken, allowedTo("ADMIN"), asyncWrapper(getUsers));

// router
//   .route("/user")
//   .all(verifyToken, allowedTo("ADMIN"), userByEmailValidation, validator)
//   .get(asyncWrapper(getUserByEmail))
//   .delete(asyncWrapper(deleteUserByEmail));

// router
//   .route("/user/:userId/isDeleted")
//   .patch(
//     verifyToken,
//     allowedTo("ADMIN"),
//     updateIsDeletedValidation,
//     validator,
//     asyncWrapper(updateIsDeleted)
//   );

// router
//   .route("/user/:userId/role")
//   .patch(
//     verifyToken,
//     allowedTo("ADMIN"),
//     updateUserRoleValidation,
//     validator,
//     asyncWrapper(updateUserRole)
//   );

// // router
// //   .route("/workout")
// //   .post(
// //     verifyToken,
// //     allowedTo("ADMIN"),
// //     workoutValidation,
// //     validator,
// //     createWorkout
// //   );

// module.exports = router;
