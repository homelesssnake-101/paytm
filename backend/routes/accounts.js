const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapasync");
const { accountsmodel, usermodel } = require("../../db");
const AppError = require("../utils/errors");
const authmiddleware = require("../middlewares");
const { infoSchema, userSchema } = require("../zod");
const mongoose = require("mongoose");
const secretKey = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

router.get(
  "/balance",
  authmiddleware,
  wrapAsync(async (req, res, next) => {
    try {
      const { currentuser } = req.body;
      console.log(currentuser);
      const user = await usermodel.findOne({ _id: currentuser.id });
      const account = await accountsmodel.findOne({ userId: user._id });
      res.status(200).json({ balance: account.balance });
    } catch (error) {
      console.log(error);
      throw new AppError("Balance not found", 400);
    }
  })
);

router.post(
  "/transfer",
  authmiddleware,
  wrapAsync(async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const { currentuser } = req.body;
      const { info } = infoSchema.parse(req.body);
      const user = await usermodel
        .findOne({ _id: currentuser.id })
        .session(session)
        .session(session);
      const fromaccount = await accountsmodel
        .findOne({ userId: user._id })
        .populate("transactions.toId")
        .session(session);
      const toaccount = await accountsmodel
        .findOne({ userId: info.toUser })
        .populate("transactions.toId")
        .session(session);
      if (!fromaccount || !toaccount) {
        throw new AppError("User not found", 400);
      }
      if (fromaccount.balance < Number(info.amount)) {
        throw new AppError("Insufficient balance", 400);
      }
      fromaccount.balance -= Number(info.amount);
      toaccount.balance += Number(info.amount);
      fromaccount.transactions.push({
        type: "transfer(out)",
        toId: toaccount.userId,
        amount: Number(info.amount),
      });
      toaccount.transactions.push({
        type: "transfer(in)",
        toId: fromaccount.userId,
        amount: Number(info.amount),
      });
      await fromaccount.save({ session });
      await toaccount.save({ session });
      await session.commitTransaction();
      res.status(200).json({ message: "Transfer successful" });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new AppError(
        error.message ? error.message : "Transfer failed",
        400
      );
    } finally {
      session.endSession();
    }
  })
);

module.exports = router;
