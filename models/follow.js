const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const followSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  follower: [{ type: Schema.ObjectId, ref: "User" }],
  followerCount: {
    type: Number,
    default: 0,
  },
  following: [{ type: Schema.ObjectId, ref: "User" }],
  followingCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Follow", followSchema);
