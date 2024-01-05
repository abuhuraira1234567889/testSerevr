const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    name: String,
    companyName: String,
    companyAddress: String,
    phoneNo: String,
    email: String,
    password: String,
    verificationToken: String,
    personalDetail: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      default: "",
    },
    role: {
      type: Number,
      default: 0
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("auth", authSchema);
