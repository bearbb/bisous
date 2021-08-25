const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//import notification model
const Notification = require("./notification");

const commentSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.ObjectId,
      ref: "User",
    },
    post: {
      type: Schema.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

//create a middleware that run after new comment be saved
commentSchema.post("save", (doc) => {
  console.log("new document is saved");
  console.log(doc);
  let newNotification = new Notification({
    notificationCode: "COMMENT",
  });
newNotification = newNotification.save()
});

module.exports = mongoose.model("Comment", commentSchema);
