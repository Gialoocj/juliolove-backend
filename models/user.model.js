const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      minlength: 6,
      required: true,
    },
    email: {
      type: String,
      minlength: 5,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      minlength: 6,
      required: true,
    },
    phonenumber: {
      type: String,
      minlength: 10,
      maxlenght: 11,
    },
    avatar: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    carts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cart",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "shop"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
