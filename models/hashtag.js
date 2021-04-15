const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const hashtagSchema = new Schema({
  hashtag: {
    type: String,
    required: true,
  },
  postIds: [{ type: Schema.ObjectId, ref: "Post" }],
  postCount: {
    type: Number,
    default: 1,
  },
});
//Middleware - auto update post count after save
hashtagSchema.post("save", (doc) => {
  //update post count
  doc.postCount = doc.postIds.length;
});

module.exports = mongoose.model("Hashtag", hashtagSchema);
