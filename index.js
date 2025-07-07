const express = require("express");
const app = express();
const indexRouter = require("./backend/routes/index");
const cors = require("cors");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const AppError = require("./backend/utils/errors");

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1", indexRouter);

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.log(err);
  return res.status(404).json({ message: "Page not found" });
});
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
