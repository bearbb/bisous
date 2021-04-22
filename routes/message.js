const express = require("express");
const Message = require("../models/message");
const User = require("../models/user");
const authenticate = require("../authenticate");
const verify = require("../verify");

const messageRouter = express.Router();

messageRouter
  .route("/t/:receiverId")
  .post(authenticate.verifyUser, verify.verifyReceiverId, async (req, res) => {
    try {
      let receiverDoc = await User.findById(req.params.receiverId).lean();
      //receiver exists
      if (receiverDoc) {
        //init socket and join to this userId room
        const io = req.app.get("socketIO");
        io.on("connection", (socket) => {
          console.log("connected");
          socket.join(`${req.user._id}`);
          socket.on("disconnect", () => {
            console.log("disconnected");
          });
          socket.on("send-chat-message", async (msg) => {
            //check if msg is an empty string
            msg = `${msg}`;
            if (msg !== "") {
              socket.emit("chat-message-error", "Message shouldn't be empty");
            } else {
              let message = new Message({
                sender: `${req.user._id}`,
                receiver: req.params.receiverId,
                message: msg,
                participants: [`${req.user._id}`, req.params.receiverId],
              });
              message = await message.save();
              console.log("Message doc created");
              socket.broadcast
                .to(req.params.receiverId)
                .emit("chat-message", msg);
            }
          });
        });
        res
          .status(200)
          .json({ success: true, message: "Connect successfully" });
      } else {
        res.status(403).json({ success: false, message: "Receiver not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .get(authenticate.verifyUser, verify.verifyReceiverId, async (req, res) => {
    try {
      const senderID = `${req.user._id}`;
      const receiverID = `${req.params.receiverId}`;
      //check if receiver exist
      let receiverDoc = await User.findById(req.params.receiverId).lean();
      if (receiverDoc) {
        //find and limit latest 10 msgs
        //find all document contain array that contain both userId
        let messages = await Message.find({
          chatParticipants: { $all: [senderID, receiverID] },
        })
          .select("message createdAt sender receiver -_id")
          .populate({ path: "sender", select: "username -_id" })
          .populate({ path: "receiver", select: "username -_id" })
          .limit(10)
          .exec();
        // messages = await messages
        //   .populate("sender")
        //   .populate("receiver")
        //   .execPopulate();
        res.status(200).json({ messages });
      } else {
        res.status(403).json({ message: "Receiver not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  });

module.exports = messageRouter;
