const { Exercise, Workout } = require("../models/workoutModel");
const appError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const mongoose = require("mongoose");

const getAllExercises = async (req, res, next) => {
  const { category, bodyPart, search, sortBy, sortOrder } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const query = {};

  // Category filter
  if (category) {
    query.category =
      category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  }

  // Body part filter (mapped to primaryMuscles)
  if (bodyPart) {
    const bodyPartMuscles = {
      upper: ["Chest", "Back", "Arms", "Shoulders"],
      lower: ["Legs"],
      core: ["Core"],
      cardio: ["Cardio"],
    };

    const muscles = bodyPartMuscles[bodyPart.toLowerCase()];
    if (muscles) {
      query.primaryMuscles = { $in: muscles };
    }
  }

  // Search by exercise name (case-insensitive partial match)
  if (search) {
    const keywords = search.trim().split(/\s+/); // split by spaces
    const orConditions = [];

    keywords.forEach((keyword) => {
      const regex = new RegExp(keyword, "i"); // case-insensitive

      orConditions.push({ name: { $regex: regex } });
      orConditions.push({
        primaryMuscles: {
          $in: [
            keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase(),
          ],
        },
      });
      orConditions.push({
        secondaryMuscles: {
          $in: [
            keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase(),
          ],
        },
      });
      orConditions.push({
        equipment: { $in: [keyword.toLowerCase()] },
      });
    });

    // Merge with existing query
    if (!query.$and) query.$and = [];
    query.$and.push({ $or: orConditions });
  }

  // Sort logic
  let sortOptions = { createdAt: -1 }; // default
  if (sortBy) {
    const validFields = ["difficulty", "duration", "createdAt"];
    if (validFields.includes(sortBy)) {
      const order = sortOrder === "asc" ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }
  }

  const exercises = await Exercise.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sortOptions);

  const totalExercises = await Exercise.countDocuments(query);

  if (!exercises || exercises.length === 0) {
    return next(appError.create("No exercises found", 404, "FAIL"));
  }

  const difficultyLevels = (await Exercise.distinct("difficulty", query))
    .length;

  const lowerDuration = await Exercise.findOne(query, { duration: 1 }).sort({
    duration: 1,
  });

  const upperDuration = await Exercise.findOne(query, { duration: 1 }).sort({
    duration: -1,
  });

  res.status(200).json({
    status: "success",
    message: "Exercises retrieved successfully",
    results: exercises.length,
    totalExercises,
    difficultyLevels,
    currentPage: page,
    totalDuration: {
      min: lowerDuration ? lowerDuration.duration : "N/A",
      max: upperDuration ? upperDuration.duration : "N/A",
    },
    totalPages: Math.ceil(totalExercises / limit),
    data: { exercises },
  });
};

const getExerciseById = async (req, res, next) => {
  const { exerciseId } = req.params;
  if (!exerciseId) {
    return next(appError.create("Exercise ID is required", 400, "FAIL"));
  }

  const exercise = await Exercise.findByIdAndUpdate(
    exerciseId,
    { $inc: { usageCount: 1 } },
    { new: true }
  );

  if (!exercise) {
    return next(appError.create("Exercise not found", 404, "FAIL"));
  }

  // Find related exercises
  const relatedExercises = await Exercise.find({
    _id: { $ne: exercise._id }, // Exclude current one
    category: exercise.category,
    primaryMuscles: { $in: exercise.primaryMuscles },
  })
    .limit(3)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    message: "Exercise retrieved successfully",
    data: {
      exercise,
      relatedExercises,
    },
  });
};

const getPopularExercises = async (req, res, next) => {
  let popular = await Exercise.find(
    {},
    {
      name: 1,
      description: 1,
      category: 1,
      primaryMuscles: 1,
      difficulty: 1,
      duration: 1,
      usageCount: 1,
    }
  )
    .sort({ usageCount: -1 })
    .limit(4); // Top 10

  if (!popular || popular.length === 0) {
    popular = await Exercise.find().sort({ createdAt: -1 }).limit(4); // Fallback to recent
  }

  res.status(200).json({
    status: "success",
    message: "Popular exercises retrieved successfully",
    results: popular.length,
    data: { popular },
  });
};

const addExercise = async (req, res, next) => {
  const {
    name,
    description,
    primaryMuscles,
    secondaryMuscles,
    duration,
    difficulty,
    instructions,
    equipment,
    sets,
    reps,
    rest,
    category,
  } = req.body;

  const exercise = await Exercise.findOne({ name });
  if (exercise) {
    return next(appError.create("Exercise already exists", 400, "FAIL"));
  }

  const newExercise = new Exercise({
    name,
    description,
    primaryMuscles: primaryMuscles?.split(",").map((m) => m.trim()),
    secondaryMuscles: secondaryMuscles?.split(",").map((m) => m.trim()),
    equipment: equipment ? equipment.split(",").map((e) => e.trim()) : ["none"],
    duration,
    difficulty,
    instructions,
    sets,
    reps,
    rest,
    category,
    mediaUrl: req.file?.path || undefined, // ✅ Cloudinary URL
  });
  await newExercise.save();
  res.status(201).json({
    status: "success",
    message: "Exercise added successfully",
    data: { exercise: newExercise },
  });
};

// Update an existing exercise
const updateExercise = async (req, res, next) => {
  const { exerciseId } = req.params;

  const existing = await Exercise.findById(exerciseId);
  if (!existing) {
    return next(appError.create("Exercise not found", 404, "FAIL"));
  }

  // Extract fields from req.body
  const {
    name,
    description,
    primaryMuscles,
    secondaryMuscles,
    duration,
    difficulty,
    instructions,
    equipment,
    sets,
    reps,
    rest,
    category,
  } = req.body;

  // Update fields if provided
  if (name) {
    const existingName = await Exercise.findOne({ name });
    if (existingName && existingName._id.toString() !== exerciseId) {
      return next(appError.create("Exercise name already exists", 400, "FAIL"));
    }
    existing.name = name;
  }
  if (description) existing.description = description;
  if (duration) existing.duration = duration;
  if (difficulty) existing.difficulty = difficulty;
  if (instructions) existing.instructions = instructions;
  if (sets) existing.sets = sets;
  if (reps) existing.reps = reps;
  if (rest) existing.rest = rest;
  if (category) existing.category = category;

  // Handle array fields from form-data (split by commas)
  if (primaryMuscles) {
    existing.primaryMuscles = primaryMuscles
      .split(",")
      .map((item) => item.trim());
  }
  if (secondaryMuscles) {
    existing.secondaryMuscles = secondaryMuscles
      .split(",")
      .map((item) => item.trim());
  }
  if (equipment) {
    existing.equipment = equipment.split(",").map((item) => item.trim());
  }

  // Handle new media upload (if any)
  if (req.file) {
    existing.mediaUrl = req.file.path || req.file.secure_url;
  }

  await existing.save();

  res.status(200).json({
    status: "success",
    message: "Exercise updated successfully",
    data: { exercise: existing },
  });
};

const deleteExercise = async (req, res) => {
  const { exerciseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
    throw appError.create("Invalid exercise ID", 400, "fail");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const exercise = await Exercise.findById(exerciseId).session(session);
  if (!exercise) {
    await session.abortTransaction();
    session.endSession();
    throw appError.create("Exercise not found", 404, "fail");
  }

  // Remove exercise from all workouts (from all days)
  await Workout.updateMany(
    { "days.exercises": exerciseId },
    { $pull: { "days.$[].exercises": exerciseId } },
    { session }
  );

  // Delete the exercise
  await Exercise.findByIdAndDelete(exerciseId).session(session);

  await session.commitTransaction();
  session.endSession();

  res.status(200).json({
    status: "success",
    message: "Exercise deleted and removed from workouts successfully",
    data: null,
  });
};

module.exports = {
  getAllExercises,
  getExerciseById,
  getPopularExercises,
  addExercise,
  updateExercise,
  deleteExercise,
};
