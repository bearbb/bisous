const { app } = require("../app");
const secureServer = app.get("secureServer");

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
  socket.on("authenticateFromClient", (data) => {
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    console.log(cookies);
    socket.emit("connect", "successfully");
  });
});

module.exports = io;
