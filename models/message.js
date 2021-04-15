const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    //Chat id will be an array contain 2 id of sender and receiver
    chatParticipants: [{ type: String, required: true }],
  },
  { timestamps: true }
);

messageSchema.path("chatParticipants").validate((value) => {
  if (value.length > 2) {
    throw new Error("Chat participants can't be greater than 2");
  }
});

module.exports = mongoose.model("Message", messageSchema);
