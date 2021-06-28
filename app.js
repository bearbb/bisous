const express = require("express");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const config = require("./config");
const passport = require("passport");
const https = require("https");
const cors = require("cors");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const postRouter = require("./routes/post");
const commentRouter = require("./routes/comment");
const favoriteRouter = require("./routes/favorite");
const followRouter = require("./routes/follow");
const hashtagRouter = require("./routes/hashtag");
const messageRouter = require("./routes/message");
const socketRouter = require("./routes/socket");
const imageRouter = require("./routes/image");
const searchRouter = require("./routes/search");

const app = express();
global.CronJob = require("./cron.js");

app.use(passport.initialize());
const whiteList = ["https://swanoogie.me", "http://localhost:3000"];
const corsOptions1 = {
  origin: "http://localhost:3000",
  credentials: true,
};
const corsOptions2 = {
  origin: "https://swanoogie.me",
  credentials: true,
};
const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions1));
//connect to mongodb
mongoose.connect(config.mongodb.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback() {
  console.log("h");
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.key));
// app.use(express.static(path.join(__dirname, "public")));

//app.use("/api/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts/", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/follows", followRouter);
app.use("/api/hashtags", hashtagRouter);
app.use("/api/messages/", messageRouter);
app.use("/api/socket", socketRouter);
app.use("/api/images", imageRouter);
app.use("/api/search", searchRouter);

module.exports = { app: app };
