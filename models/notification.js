const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    notificationCode: {
      type: String,
      enum: ["LIKE", "COMMENT", "FOLLOW", "MESSAGE"],
    },
    relatedPost: {
      type: Schema.ObjectId,
      ref: "Post",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    notificationInitiator: {
      type: Schema.ObjectId,
      ref: "User",
    },
    owner: {
      type: Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const notificationByOwnerSchema = new Schema({
  owner: {
    type: Schema.ObjectId,
    ref: "User",
  },
  notifications: [notificationSchema],
});

const Notification = mongoose.model("Notification", notificationSchema);
const NotificationByOwner = mongoose.model(
  "NotificationByOwner",
  notificationByOwnerSchema
);

module.exports = { Notification, NotificationByOwner };
