//import notification
const { NotificationByOwner } = require("./notification");

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
    posts: [{ type: String }],
    postCount: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "60dd3e16784646034844a4e8",
    },
  },
  { timestamps: true }
);

//middleware for user schema
User.post("save", (doc) => {
  //create a notificationByOwner document with this userId
  let notiByOwnerDoc = new NotificationByOwner({
    owner: doc._id,
    notifications: [],
  });
  notiByOwnerDoc = notiByOwnerDoc.save();
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
