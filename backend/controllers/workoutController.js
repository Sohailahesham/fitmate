const User = require("../models/userModel");
const { Workout } = require("../models/workoutModel");
const appError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const mongoose = require("mongoose");

const workoutStats = async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("workouts.workout");

  if (!user || user.isDeleted) {
    return next(appError.create(404, "User not found", "fail"));
  }

  const metrics = user.getProgressMetrics();

  res.status(200).json({
    status: "success",
    message: "Workout statistics retrieved successfully",
    data: {
      hoursTrained: metrics.hoursTrained,
      goalPercentage: metrics.goalPercentage,
      lastWorkout: user.workouts[user.workouts.length - 1]?.date,
      activeWorkouts: user.workouts.filter(
        (w) => w.completionStatus === "active"
      ).length,
    },
  });
};

const todayWorkout = async (req, res, next) => {
  const { page, limit, skip } = getPagination({
    page: req.query.page,
    limit: 4,
  });

  const today = new Date();
  const dayOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][today.getDay()];

  const user = await User.findById(req.user.id).populate({
    path: "workouts.workout",
    populate: {
      path: "days.exercises",
      select: "name sets reps completed", // select only these fields
    },
  });

  if (!user) {
    return next(appError.create("User not found", 404, "fail"));
  }

  const todaysWorkouts = user.workouts
    .filter((w) => w.completionStatus === "active")
    .flatMap((w) =>
      w.workout.days
        .filter((d) => d.day === dayOfWeek)
        .map((d) => {
          const totalExercises = d.exercises.length;
          const paginatedExercises = d.exercises
            .slice(skip, skip + limit)
            .map((ex) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              isCompleted: ex.completed ?? false, // fallback if field doesn't exist
            }));

          return {
            workoutId: w.workout._id,
            workoutName: w.workout.name,
            day: d.day,
            totalExercises,
            currentPage: page,
            totalPages: Math.ceil(totalExercises / limit),
            exercises: paginatedExercises,
          };
        })
    );

  res.status(200).json({
    status: "success",
    message: "Today's workout retrieved successfully",
    data: {
      todaysWorkouts,
    },
  });
};

const postWorkouts = async (req, res, next) => {
  const {
    name,
    description,
    goals,
    rating,
    duration,
    difficulty,
    benefits,
    days,
    frequency,
  } = req.body;

  const existingWorkout = await Workout.findOne({ name });
  if (existingWorkout) {
    return next(
      appError.create("Workout with this name already exists", 400, "fail")
    );
  }

  const workout = await Workout.create({
    name,
    description,
    goals,
    frequency,
    rating,
    duration,
    difficulty,
    benefits,
    days,
  });

  res.status(201).json({
    status: "success",
    message: "Workout created successfully",
    data: {
      workout,
    },
  });
};

const postUserWorkout = async (req, res, next) => {
  const { workoutId } = req.body;
  const userId = req.user.id;

  // ✅ Check if workout exists
  const workout = await Workout.findById(workoutId);
  if (!workout) {
    return next(appError.create("Workout not found", 404, "fail"));
  }

  // ✅ Get user and check if workout already active
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    return next(appError.create("User not found", 404, "fail"));
  }

  const alreadyActive = user.workouts.some(
    (w) =>
      w.workout.toString() === workoutId && w.completionStatus !== "completed"
  );

  if (alreadyActive) {
    return next(appError.create("Workout already active", 400, "fail"));
  }

  // ✅ Add the workout to user's active workouts
  user.workouts.push({
    workout: workoutId,
    completionStatus: "active",
    currentDayIndex: 0,
    startDate: new Date(),
  });

  await user.save();
  await user.populate("workouts.workout");

  res.status(201).json({
    status: "success",
    message: "Workout scheduled successfully",
    data: {
      workout: user.workouts[user.workouts.length - 1],
    },
  });
};

const updateWorkoutStatus = async (req, res, next) => {
  const { completionStatus } = req.body;
  const { workoutId } = req.params;
  const userId = req.user.id;

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      "workouts.workout": workoutId,
    },
    {
      $set: {
        "workouts.$.completionStatus": completionStatus,
        "workouts.$.completedAt":
          completionStatus === "completed" ? new Date() : null,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    return next(appError.create("User or workout not found", 404, "fail"));
  }
  if (completionStatus === "completed") {
    updatedUser.workouts.forEach((w) => {
      if (w.workout.toString() === workoutId) {
        w.completedAt = new Date();
      }
    });
    await updatedUser.save();
  }

  res.status(200).json({
    status: "success",
    message: "Workout status updated successfully",
    data: {
      workout: updatedUser.workouts.find(
        (w) => w.workout.toString() === workoutId
      ),
    },
  });
};

const getWorkouts = async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const workouts = await Workout.find({})
    .select("name description duration difficulty")
    .skip(skip)
    .limit(limit);
  if (!workouts || workouts.length === 0) {
    return next(appError.create("No workouts found", 404, "fail"));
  }

  const total = await Workout.countDocuments({});

  res.status(200).json({
    status: "success",
    message: "Workouts retrieved successfully",
    total,
    page,
    pages: Math.ceil(total / limit),
    data: {
      workouts,
    },
  });
};

const getWorkoutHistory = async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).populate("workouts.workout");

  if (!user || user.isDeleted) {
    return next(appError.create("User not found", 404, "FAIL"));
  }

  const completedWorkouts = user.workouts
    .filter((w) => w.completionStatus === "completed")
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .map((w) => ({
      name: w.workout?.name || "Deleted Workout",
      duration: w.workout?.duration || "0 min",
      completedAt: w.completedAt,
      completionStatus: w.completionStatus,
    }));

  res.status(200).json({
    status: "success",
    message: "Workout history retrieved successfully",
    results: completedWorkouts.length,
    data: { history: completedWorkouts },
  });
};

const updateWorkout = async (req, res, next) => {
  const { workoutId } = req.params;
  const updates = {};

  const fields = [
    "name",
    "description",
    "goals",
    "duration",
    "difficulty",
    "benefits",
    "frequency",
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, updates, {
    new: true,
  });

  if (!updatedWorkout) {
    return next(appError.create("Workout not found", 404, "fail"));
  }

  res.status(200).json({
    status: "success",
    message: "Workout updated successfully",
    data: {
      workout: updatedWorkout,
    },
  });
};

const deleteWorkout = async (req, res, next) => {
  const { workoutId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(workoutId)) {
    return next(appError.create("Invalid workout ID", 400, "fail"));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

  if (!deletedWorkout) {
    await session.abortTransaction();
    session.endSession();
    return next(appError.create("Workout not found", 404, "fail"));
  }

  await User.updateMany(
    { "workouts.workout": workoutId },
    { $pull: { workouts: { workout: workoutId } } },
    { session }
  );

  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    message: "Workout deleted successfully",
    data: {
      workout: deletedWorkout,
    },
  });
};

const addExerciseToWorkout = async (req, res, next) => {
  const { workoutId } = req.params;
  const { exerciseId, day } = req.body;

  const existingWorkout = await Workout.findById(workoutId);
  if (!existingWorkout) {
    return next(appError.create("Workout not found", 404, "fail"));
  }

  const targetDay = existingWorkout.days.find((d) => d.day === day);
  if (!targetDay) {
    return next(
      appError.create(`Day '${day}' not found in workout`, 404, "fail")
    );
  }

  if (targetDay.exercises.includes(exerciseId)) {
    return next(
      appError.create(
        "Exercise already exists in this workout day",
        400,
        "fail"
      )
    );
  }

  targetDay.exercises.push(exerciseId);
  await existingWorkout.save();

  res.status(200).json({
    status: "success",
    message: "Exercise added to workout successfully",
    data: { updatedWorkout: existingWorkout },
  });
};

const completeExercise = async (req, res, next) => {
  const { workoutId, exerciseId } = req.params;
  const userId = req.user.id;
  const today = new Date();
  const todayStart = today.setHours(0, 0, 0, 0); // Normalize to start of the day
  const todayEnd = today.setHours(23, 59, 59, 999); // Normalize to end of the day

  const user = await User.findById(userId).populate("workouts.workout");

  if (!user) {
    return next(appError.create("User not found", 404, "fail"));
  }

  const userWorkout = user.workouts.find(
    (w) => w.workout._id.toString() === workoutId
  );
  if (!userWorkout) {
    return next(appError.create("Workout not found", 404, "fail"));
  }

  const alreadyCompleted = userWorkout.completedExercises.some(
    (ex) =>
      ex.exerciseId.toString() === exerciseId &&
      ex.dateCompleted >= todayStart &&
      ex.dateCompleted <= todayEnd
  );

  if (alreadyCompleted) {
    return next(
      appError.create("Exercise already marked as completed", 400, "fail")
    );
  }

  userWorkout.completedExercises.push({
    exerciseId,
    dateCompleted: new Date(),
  });
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Exercise marked as completed successfully",
    data: {
      userWorkout,
      exercise: {
        exerciseId,
        completed: true,
        dateCompleted: new Date(),
      },
    },
  });
};

module.exports = {
  workoutStats,
  todayWorkout,
  postUserWorkout,
  postWorkouts,
  updateWorkoutStatus,
  getWorkouts,
  getWorkoutHistory,
  updateWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  completeExercise,
};
