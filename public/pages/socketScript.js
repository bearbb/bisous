const io = require("socket.io-client");
const socket = io("https://localhost:3443");

socket.on("chat-message", (data) => {
  console.log(data);
});

socket.on("user-connected", (user) => {
  console.log(user, " connected");
});

const username = prompt("Type in ur name");
socket.emit("new-user", username);

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value;
  socket.emit("send-chat-message", message);
  messageInput.value = "";
});
