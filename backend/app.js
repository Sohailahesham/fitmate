require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
const passportSetup = require("./config/passport-setup");
const verifyToken = require("./middlewares/verifyToken");
const allowedTo = require("./middlewares/allowedTo");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
// Generate a random hexadecimal number for jwt secret key
// const randomNumber = crypto.randomBytes(64).toString("hex", 16);
// console.log(randomNumber);

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB is connected successfully");
    app.listen(3000, () =>
      console.log(`app listening on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

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
app.use("/api/dashboard", adminRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    message: err.message,
    code: err.statusCode || 500,
  });
});
