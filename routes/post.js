const express = require("express");
const passport = require("passport");
const User = require("../models/user");
const Post = require("../models/post");
const authenticate = require("../authenticate");
const verify = require("../verify");
const ObjectId = require("mongoose").Types.ObjectId;

const postRouter = express.Router();

postRouter
  .route("/")
  //get all posts
  .get(async (req, res, next) => {
    try {
      let posts = await Post.find({}).limit(20).exec();
      posts = await posts
        .populate({ path: "author", select: ["username", "email"] })
        .execPopulate();
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ err });
    }
  })
  .post(authenticate.verifyUser, async (req, res, next) => {
    //check if any data is missing
    let postErr = verify.verifyPost(req.body);
    if (Object.keys(postErr).length === 0) {
      let postData = {
        author: req.user._id,
        pictures: [...req.body.pictures],
        likes: [],
        comments: [],
        caption: req.body.caption,
        hashtags: [...req.body.hashtags],
      };
      let post = new Post(postData);
      try {
        post = await post.save();
        res
          .status(200)
          .json({ success: true, message: "Upload successfully", post });
      } catch (err) {
        console.error(err);
        res.status(403).json({ success: false, err });
      }
    } else {
      res.status(403).json({ success: false, message: "Missing data" });
    }
  })
  .put((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support PUT operation" });
  })
  .delete((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support DELETE operation" });
  });

postRouter
  .route("/:postId")
  .get(async (req, res) => {
    try {
      //check if valid id
      if (ObjectId.isValid(req.params.postId)) {
        let post = await Post.findById(req.params.postId).exec();
        //check if post exists
        if (post != null) {
          //if not null then populate author field
          //TODO: populate likes, comments, hashtags be4 return
          post = await post
            .populate({ path: "author", select: ["username", "email"] })
            .execPopulate();
          res.status(200).json({ success: true, post });
        } else {
          res.status(403).json({
            success: false,
            message: "No post with given id was found",
          });
        }
      } else {
        res
          .status(403)
          .json({ success: false, message: "Not a valid post id" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, err });
    }
  })
  .post((req, res) => {
    res
      .status(405)
      .json({ Error: "This route does not support POST operation" });
  })
  .put(authenticate.verifyUser, async (req, res) => {
    try {
      //check if valid id
      if (ObjectId.isValid(req.params.postId)) {
        let post = await Post.findById(req.params.postId).exec();
        //check if that user is the owner
        console.log("post author");
        console.log(post.author);
        console.log("user request");
        console.log(req.user._id);
        if (`${post.author}` == `${req.user._id}`) {
          //update avail for pictures, caption, hashtags
          if (req.body.pictures && req.body.pictures.length >= 1) {
            post.pictures = [...req.body.pictures];
          }
          if (req.body.caption && req.body.caption !== "") {
            post.caption = req.body.caption;
          }
          if (req.body.hashtags && req.body.hashtags.length >= 1) {
            post.hashtags = [...req.body.hashtags];
          }
          post = await post.save();
          //populate be4 return
          post = await post
            .populate({ path: "author", select: ["username", "email"] })
            .execPopulate();
          res
            .status(200)
            .json({ success: true, message: "Update successfully", post });
        } else {
          res.status(401).json({ success: false, message: "Unauthorized" });
        }
      } else {
        res
          .status(403)
          .json({ success: false, message: "Not a valid post id" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, err });
    }
  })
  .delete(authenticate.verifyUser, async (req, res) => {
    try {
      //check if valid id
      if (ObjectId.isValid(req.params.postId)) {
        let post = await Post.findById(req.params.postId).exec();
        //check if that user is the owner
        if (`${post.author}` == `${req.user._id}`) {
          const resp = await Post.deleteOne({ _id: post._id });
          console.log(resp);
          res
            .status(200)
            .json({ success: true, message: "Delete successfully" });
        } else {
          res.status(401).json({ success: false, message: "Unauthorized" });
        }
      } else {
        res
          .status(403)
          .json({ success: false, message: "Not a valid post id" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, err });
    }
  });
module.exports = postRouter;
