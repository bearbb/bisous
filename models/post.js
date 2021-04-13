const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// const pictureSchema = new Schema({
//   path: {
//     type: String,
//     required: true,
//   },
// });
const postSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
    },
    pictures: [{ type: String, required: true }],
    likes: [{ type: Schema.ObjectId, ref: "User" }],
    comments: [{ type: Schema.ObjectId, ref: "Comment" }],
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

module.exports = mongoose.model("Post", postSchema);
