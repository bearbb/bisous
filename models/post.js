const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const pictureSchema = new Schema({
//   path: {
//     type: String,
//     required: true,
//   },
// });
// const likeSchema = new Schema({
//   author: {
//     type: Schema.ObjectId,
//     ref: "User",
//   },
// });
const commentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.ObjectId,
    ref: "User",
  },
});
const postSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
    },
    pictures: [{ type: String, required: true }],
    likes: [{ type: Schema.ObjectId, ref: "User" }],
    comments: [commentSchema],
    caption: {
      type: String,
      default: "",
    },
    hashtags: [
      {
        type: String,
        default: "",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
