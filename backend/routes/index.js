const express = require("express");
const router = express.Router();
const userRouter = require("./user");
const accountsRouter = require("./accounts");

router.use("/user", userRouter);
router.use("/accounts", accountsRouter);

module.exports = router;
