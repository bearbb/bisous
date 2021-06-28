const express = require("express");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
// const Hashtag = require("../models/hashtag");
const authenticate = require("../authenticate");
const verify = require("../verify");
const utility = require("../utility");

const searchRouter = express.Router();

searchRouter
  .route("/:searchContent")
  .get(authenticate.verifyUser, async (req, res) => {
    try {
      //Search for user
      let userDoc = await User.find({
        $text: { $search: `${req.params.searchContent}` },
      });
      let postDoc = await Post.find({
        $text: { $search: `${req.params.searchContent}` },
      });
      res.status(200).json({ userDoc, postDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Something went wrong, pls try again" });
    }
  });

module.exports = searchRouter;
