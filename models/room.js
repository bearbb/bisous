const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomId: {
    type: String,
    required: true,
  },
  //   participants: [{ type: Schema.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Room", roomSchema);
