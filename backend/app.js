require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
require("./jobs/deleteOldUsers");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const exerciseRouter = require("./routes/exerciseRoute");
const workoutRouter = require("./routes/workoutRoutes");
const profileRouter = require("./routes/profileRoutes");
const passportSetup = require("./config/passport-setup");
const verifyToken = require("./middlewares/verifyToken");
const allowedTo = require("./middlewares/allowedTo");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { limiter } = require("./middlewares/rateLimit");
// Generate a random hexadecimal number for jwt secret key
// const randomNumber = crypto.randomBytes(64).toString("hex", 16);
// console.log(randomNumber);

const app = express();
// console.log(new Date(Date.now() - 31 * 24 * 60 * 60 * 1000));
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB is connected successfully");
    app.listen(3000, () =>
      console.log(`app listening on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));

//console.log("JWT Secret:", process.env.ACCESS_TOKEN_KEY);
app.use(limiter);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origin: "http://localhost:5173", // Adjust based on frontend URL
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", verifyToken, allowedTo("ADMIN", "SUBSCRIBER"), (req, res) => {
  console.log(req.user);
  res.send("home page");
});

app.get("/about", verifyToken, allowedTo("ADMIN"), (req, res) => {
  console.log(req.user);
  res.send("About page");
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/workouts", workoutRouter);
app.use("/api/profile", profileRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    message: err.message,
    code: err.statusCode || 500,
  });
});
