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

const app = express();

app.use(passport.initialize());
const corsOptions = {
  origin: "https://localhost:3000",
};
app.use(cors(corsOptions));
//connect to mongodb
const connect = mongoose.connect(config.mongodb.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.key));
// app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/posts/", postRouter);
app.use("/comments", commentRouter);
app.use("/favorites", favoriteRouter);
app.use("/follows", followRouter);
app.use("/hashtags", hashtagRouter);
app.use("/messages/", messageRouter);
app.use("/socket", socketRouter);
app.use("/images", imageRouter);

module.exports = { app: app };
