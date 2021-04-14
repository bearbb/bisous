const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  favorites: [{ type: Schema.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("Favorite", favoriteSchema);
