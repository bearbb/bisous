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
});

module.exports = io;
