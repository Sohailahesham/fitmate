const Diet = require("../models/dietModel"); // import the new model

function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const rounded = Math.round(bmi * 10) / 10;

  let status = "Normal";
  if (bmi < 18.5) status = "Underweight";
  else if (bmi < 25) status = "Normal";
  else if (bmi < 30) status = "Overweight";
  else status = "Obese";

  return { bmi: rounded, status };
}

async function getWeeklyCalorieAverage(userId) {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const formattedStart = startOfWeek.toISOString().slice(0, 10);

  const dietEntries = await Diet.find({
    userId,
    date: { $gte: formattedStart },
  });

  const totalCalories = dietEntries.reduce(
    (sum, entry) => sum + (entry.totalCalories || 0),
    0
  );
  const avg = dietEntries.length ? totalCalories / dietEntries.length : 0;

  return Math.round(avg);
}

const getWorkoutsPerWeek = async (user) => {
  const thisMonth = new Date().getMonth();

  const completedWorkouts = user.workouts.filter((w) => {
    return w.completedAt && new Date(w.completedAt).getMonth() === thisMonth;
  });

  const workoutsPerWeek = completedWorkouts.length / 4; // roughly 4 weeks per month

  return Math.round(workoutsPerWeek * 10) / 10;
};

const getGoalProgress = async (user) => {
  const target = user.goal?.targetWorkouts || 4;

  const currentWeek = new Date();
  const startOfWeek = new Date(
    currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
  );

  const thisWeekWorkouts = user.workouts.filter(
    (w) => w.completedAt && new Date(w.completedAt) >= startOfWeek
  );

  const completed = thisWeekWorkouts.length;
  const percent = Math.min((completed / target) * 100, 100);

  let status = "On track";
  if (percent < 50) status = "Falling behind";
  else if (percent < 80) status = "Needs improvement";

  return { percent: Math.round(percent), status };
};

module.exports = {
  calculateBMI,
  getWeeklyCalorieAverage,
  getWorkoutsPerWeek,
  getGoalProgress,
};
