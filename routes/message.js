const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const authenticate = require("../authenticate");
const verify = require("../verify");

const messageRouter = express.Router();

messageRouter
  .route("/:receiverId")
  .post(authenticate.verifyUser, verify.verifyReceiverId, async (req, res) => {
    try {
      //check message exist and not empty string
      if (req.body.message && req.body.message !== "") {
        let receiverDoc = await User.findById(req.params.receiverId).lean();
        //receiver exists
        if (receiverDoc) {
          let message = new Message({
            sender: req.user._id,
            receiver: receiverDoc._id,
          });
          message.message = req.body.message;
          message.chatParticipants = [message.sender, message.receiver];
          message = await message.save();
          res.status(200).json({ success: true, message });
        } else {
          res
            .status(403)
            .json({ success: false, message: "Receiver not found" });
        }
      } else {
        res.status(403).json({ success: false, message: "Missing data" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  });

module.exports = messageRouter;
