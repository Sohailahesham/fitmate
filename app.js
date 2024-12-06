require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const authRouter = require("./routes/authRoutes");
const verifyToken = require("./middlewares/verifyToken");

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

app.get("/", verifyToken, (req, res) => {
  res.send("home page");
});

app.use("/api/users", authRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || "error",
    message: err.message,
    code: err.statusCode || 500,
  });
});
