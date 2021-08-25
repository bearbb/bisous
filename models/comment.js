const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//import notification model
const { Notification, NotificationByOwner } = require("./notification");
const Post = require("./post");

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
commentSchema.post("save", async (doc) => {
  console.log("new document is saved");
  console.log(doc);
  let newNotification = new Notification({
    notificationCode: "COMMENT",
    relatedPost: doc.post,
    notificationInitiator: doc.author,
  });
  newNotification = await newNotification.save();
  //find the post author
  let post = await Post.findById(doc.post);
  //find the owner to push newNoti
  let ownerNoti = await NotificationByOwner.findOne({ owner: post.author });
  ownerNoti.notifications.push(newNotification._id);
  ownerNoti = await ownerNoti.save();
});

module.exports = mongoose.model("Comment", commentSchema);
