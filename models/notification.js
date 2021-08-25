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
    notificationReceiver: {
      type: Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
