const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: Number,
    required: true,
  },
});

const usermodel = mongoose.model("User", userSchema);

const accountsSchema = new schema({
  userId: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  transactions: [
    {
      toId: {
        type: schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
});
const accountsmodel = mongoose.model("Accounts", accountsSchema);

module.exports = { usermodel, accountsmodel };
