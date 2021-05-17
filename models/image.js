const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
    },
    path: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);
