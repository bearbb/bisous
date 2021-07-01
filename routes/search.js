const express = require("express");
const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
// const Hashtag = require("../models/hashtag");
const authenticate = require("../authenticate");

const searchRouter = express.Router();

searchRouter
  .route("/:searchContent")
  .get(authenticate.verifyUser, async (req, res) => {
    try {
      //Search for user
      let userDoc = await User.find({
        $text: { $search: `${req.params.searchContent}` },
      });
      let userData = userDoc.map((obj) => {
        //TODO: return user avatar
        return { username: obj.username, userId: obj._id };
      });
      let postDoc = await Post.find({
        $text: { $search: `${req.params.searchContent}` },
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({ path: "author", select: ["username", "email", "avatar"] })
        .populate({ path: "hashtags", select: "hashtag" })
        .exec();
      res.status(200).json({
        // user: { username: userDoc.username, userId: userDoc._id },
        userData,
        //TODO: return user avatar
        postDoc,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Something went wrong, pls try again" });
    }
  });

module.exports = searchRouter;
