const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync");
const { userSchema, infoSchema } = require("../zod");
const { usermodel, accountsmodel } = require("../../db");
const AppError = require("../utils/errors");
const authmiddleware = require("../middlewares");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET;

const jwt = require("jsonwebtoken");
router.put(
  "/",
  authmiddleware,
  wrapAsync(async (req, res, next) => {
    try {
      const { currentuser } = req.body;
      const user = await usermodel.findOne({ _id: currentuser.id });
      if (!user) {
        throw new AppError("User not found", 400);
      }
      const newcredentials = userSchema.parse(req.body);

      user.firstName = newcredentials.user.firstName;
      user.lastName = newcredentials.user.lastName;
      user.password = newcredentials.user.password;
      await user.save();
      res
        .status(200)
        .json({
          message: "User updated successfully",
          user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });
    } catch (error) {
      console.log(error);
      throw new AppError(
        error.message ? error.message : "User updation failed",
        400
      );
    }
  })
);

router.get(
  "/bulk",
  authmiddleware,
  wrapAsync(async (req, res, next) => {
    try {
      const query = req.query.filter ? req.query.filter : "";
      const users = await usermodel.find({
        $or: [
          {
            firstName: {
              $regex: query,
              $options: "i",
            },
          },
          {
            lastName: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      });

      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      throw new AppError("Users not found", 400);
    }
  })
);

router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    try {
      const { user } = userSchema.parse(req.body);
      const newuser = await usermodel.create(user);
      const newaccount = await accountsmodel.create({
        userId: newuser._id,
        balance: 1 + Math.random() * 10000,
      });

      const token = jwt.sign({ id: newuser._id }, secretKey, {
        expiresIn: "1h",
      });
      res
        .status(201)
        .json({
          token,
          message: "User created successfully",
          user: {
            username: newuser.username,
            firstName: newuser.firstName,
            lastName: newuser.lastName,
          },
        });
    } catch (error) {
      console.log(error);
      throw new AppError("User creation failed", 400);
    }
  })
);

router.post(
  "/signin",
  wrapAsync(async (req, res, next) => {
    try {
      const { user } = req.body;
      const newuser = await usermodel.findOne({ username: user.username });
      if (!newuser) {
        throw new AppError("User not found", 400);
      }
      if (newuser.password !== Number(user.password)) {
        throw new AppError("Invalid password", 400);
      }
      const token = jwt.sign({ id: newuser._id }, secretKey, {
        expiresIn: "1h",
      });
      res
        .status(200)
        .json({
          token,
          message: "User signed in successfully",
          user: {
            username: newuser.username,
            firstName: newuser.firstName,
            lastName: newuser.lastName,
          },
        });
    } catch (error) {
      throw new AppError(error.message, 400);
    }
  })
);

module.exports = router;
