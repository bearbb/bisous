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
module.exports = mongoose.model("Hashtag", hashtagSchema);
