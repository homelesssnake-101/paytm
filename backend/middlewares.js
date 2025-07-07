const AppError = require("./utils/errors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SECRET;
function authmiddleware(req, res, next) {
  try {
    const token = req.headers.authorization;
    try {
      const decoded = jwt.verify(token, secretKey);
      req.body.currentuser = decoded;
      next();
    } catch (error) {
      throw new AppError("couldnot verify token", 401);
    }
  } catch (error) {
    throw new AppError(error.message ? error.message : "unauthorized", 401);
  }
}

module.exports = authmiddleware;
