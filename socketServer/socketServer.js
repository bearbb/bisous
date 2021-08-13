const { app } = require("../app");
const secureServer = app.get("secureServer");
const cookie = require("cookie");

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
    console.log("Socket joined room ", uid);
    socket.auth = true;
  });

  socket.on("privateMessage", ({ sender, receiver, message }) => {
    socket
      .to(receiver.userId.toString())
      .emit("incomingMessage", { sender, receiver, message });
    console.log("message forwarded");
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
