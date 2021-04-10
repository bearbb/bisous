const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const User = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    facebookId: String,
    googleId: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    key: {
      publicKey: {
        type: String,
        default: "",
      },
      privateKey: {
        type: String,
        default: "",
      },
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
