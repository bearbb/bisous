const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const postSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
    },
    pictures: [{ type: String, required: true }],
    likes: [{ type: Schema.ObjectId, ref: "User" }],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [{ type: Schema.ObjectId, ref: "Comment" }],
    commentCount: {
      type: Number,
      default: 0,
    },
    caption: {
      type: String,
      default: "",
    },
    hashtags: [
      {
        type: Schema.ObjectId,
        ref: "Hashtag",
      },
    ],
  },
  { timestamps: true }
);

//Middleware - update like/commentCount after save
postSchema.post("save", (doc) => {
  doc.likeCount = doc.likes.length;
  doc.commentCount = doc.comments.length;
});
module.exports = mongoose.model("Post", postSchema);
