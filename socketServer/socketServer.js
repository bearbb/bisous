const { app } = require("../app");
const secureServer = app.get("secureServer");
const cookie = require("cookie");
const Message = require("../models/message");
const User = require("../models/user");

//init socket server

const io = require("socket.io")(secureServer, {
  cors: {
    //     origin: "https://swanoogie.me",
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected");
  //init socket auth as false
  socket.auth = false;
  socket.on("authenticateFromClient", ({ uid }) => {
    socket.userId = uid;
    socket.join(uid.toString());
    socket.emit("roomJoined", { isJoined: true });
    console.log("Socket joined room ", uid);
    socket.auth = true;
  });

  socket.on("privateMessage", async ({ sender, receiver, message }) => {
    try {
      //check if receiver exist
      let receiverDoc = await User.findById(receiver.userId).lean();
      if (receiverDoc) {
        //first create a new message doc on database then if create successfully then forward the msg
        //check if msg is not an empty string
        if (message !== "") {
          let messageDoc = new Message({
            sender: `${sender.userId}`,
            receiver: `${receiver.userId}`,
            message: message,
            participants: [`${sender.userId}`, `${receiver.userId}`],
          });
          messageDoc = await messageDoc.save();
		console.log(messageDoc);
          //forward msg now
          socket
            .to(receiver.userId.toString())
            .emit("incomingMessage", { sender, receiver, message, createdAt: messageDoc.createdAt });
          console.log("message forwarded");
        }
      }
    } catch (err) {
      socket.emit("error", "Something went wrong");
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
  //time out if client not send
  setTimeout(() => {
    if (!socket.auth) {
      console.log("disconnect socket", socket.id);
      socket.disconnect("unauthorized");
    }
  }, 1000);
});

module.exports = io;
