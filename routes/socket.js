const express = require("express");
const authenticate = require("../authenticate");
const verify = require("../verify");
const Message = require("../models/message");

const socketRouter = express.Router();

socketRouter
  .route("/t/:userId")
  .post(async (req, res) => {
    console.log(req.body);
    let senderUID = req.body.senderUID;
    let receiverUID = req.body.receiverUID;
    try {
      const io = req.app.get("socketIO");
      io.on("connection", (socket) => {
        console.log("Connected");
        socket.join(senderUID);
        socket.on("disconnect", () => {
          console.log("Disconnected");
        });
        socket.on("send-chat-message", async (msg) => {
          console.log("emit received");
          let message = new Message({ message: msg });
          message.sender = senderUID;
          message.receiver = receiverUID;
          message.chatParticipants = [senderUID, receiverUID];
          message = await message.save();
          console.log("Created a new message doc to db");
          socket.broadcast.to(receiverUID).emit("chat-message", msg);
        });
      });
      res.status(200).json({ msg: "INIT SUCCESSFUL" });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Something went wrong, please try again" });
    }
  })
  .get();

module.exports = socketRouter;
