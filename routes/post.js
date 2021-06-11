const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/comment");
// const Hashtag = require("../models/hashtag");
const authenticate = require("../authenticate");
const verify = require("../verify");
const utility = require("../utility");

const postRouter = express.Router();

postRouter
  .route("/")
  //get all posts
  .get(async (req, res, next) => {
    try {
      let posts = await Post.find({})
        .limit(20)
        .populate({ path: "author", select: ["username", "email"] })
        .populate({ path: "hashtags", select: "hashtag" })
        .exec();
      res.status(200).json(posts);
    } catch (err) {
      console.error(err);
      res.status(500).json({ err });
    }
  })
  .post(authenticate.verifyUser, async (req, res, next) => {
    //check if any data is missing
    let postErr = verify.verifyPost(req.body);
    if (Object.keys(postErr).length === 0) {
      let hashtagList = await utility.getAllHashtagIds(req.body.hashtags);
      let postData = {
        author: req.user._id,
        pictures: [...req.body.pictures],
        likes: [],
        comments: [],
        caption: req.body.caption,
        hashtags: hashtagList,
      };
      let post = new Post(postData);
      try {
        post = await post.save();
        //loop through all hashtags to push this postId
        await utility.addPostIdToHashtagList(post.hashtags, post._id);
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
  .get(verify.verifyPostId, async (req, res) => {
    try {
      //check if valid id
      let post = await Post.findById(req.params.postId).exec();
      //check if post exists
      if (post != null) {
        //if not null then populate author field
        //TODO: populate likes, comments, hashtags be4 return
        post = await post
          .populate({ path: "author", select: ["username"] })
          .populate({ path: "likes", select: "username" })
          .populate({
            path: "hashtags",
            select: "hashtag _id",
          })
          .populate({
            path: "comments",
            select: ["comment"],
            populate: { path: "author", select: "username -_id" },
          })
          .execPopulate();
        res.status(200).json({ success: true, post });
      } else {
        res.status(403).json({
          success: false,
          message: "No post with given id was found",
        });
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
  .put(authenticate.verifyUser, verify.verifyPostId, async (req, res) => {
    try {
      let post = await Post.findById(req.params.postId).exec();
      //check if that user is the owner
      if (`${post.author}` == `${req.user._id}`) {
        //update avail for pictures, caption, hashtags
        if (req.body.pictures && req.body.pictures.length >= 1) {
          post.pictures = [...req.body.pictures];
        }
        if (req.body.caption && req.body.caption !== "") {
          post.caption = req.body.caption;
        }
        if (req.body.hashtags && req.body.hashtags.length >= 1) {
          let oldHashtags = post.hashtags;
          //delete all postId from hashtagDoc.postIds from old hashtags list
          await utility.deletePostIdFromHashtagList(oldHashtags, post._id);
          let newHashtags = await utility.getAllHashtagIds([
            ...req.body.hashtags,
          ]);
          await utility.addPostIdToHashtagList(newHashtags, post._id);
          post.hashtags = newHashtags;
        }
        post = await post.save();
        //populate be4 return
        post = await post
          .populate({ path: "author", select: ["username", "email"] })
          .populate({ path: "hashtags", select: ["hashtag"] })
          .execPopulate();
        res
          .status(200)
          .json({ success: true, message: "Update successfully", post });
      } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, err });
    }
  })
  .delete(authenticate.verifyUser, verify.verifyPostId, async (req, res) => {
    try {
      let post = await Post.findById(req.params.postId).exec();
      //check if that user is the owner
      if (`${post.author}` == `${req.user._id}`) {
        //delete postId from all hashtagDoc
        await utility.deletePostIdFromHashtagList(post.hashtags, post._id);
        //delete postDoc
        const resp = await Post.deleteOne({ _id: post._id });
        res.status(200).json({ success: true, message: "Delete successfully" });
      } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, err });
    }
  });

postRouter
  .route("/:postId/likes")
  .get(verify.verifyPostId, async (req, res) => {
    try {
      //check if valid id
      let post = await Post.findById(req.params.postId).exec();
      post = await post
        .populate({ path: "likes", select: ["username", "email"] })
        .execPopulate();
      res.status(200).json({ likes: post.likes });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .post(authenticate.verifyUser, verify.verifyPostId, async (req, res) => {
    try {
      let post = await Post.findById(req.params.postId).exec();
      //check if this user is already liked it
      // = -1 => haven't liked
      let isAlreadyLiked =
        post.likes.findIndex((id) => `${id}` === `${req.user._id}`) === -1
          ? false
          : true;
      if (isAlreadyLiked) {
        res
          .status(403)
          .json({ success: false, message: "You are already liked it" });
      } else {
        post.likes.unshift(req.user._id);
        post = await post.save();
        post = await post
          .populate({ path: "likes", select: ["username", "email"] })
          .execPopulate();
        res
          .status(200)
          .json({ success: true, message: "Like successfully", post });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  })
  .put((req, res) => {
    res.status(405).json({
      success: false,
      message: "This route does not support PUT operation",
    });
  })
  .delete(authenticate.verifyUser, verify.verifyPostId, async (req, res) => {
    //check if this user is liked or not
    try {
      let post = await Post.findById(req.params.postId).exec();
      //check if this user is already liked it
      // = -1 => haven't liked
      let isAlreadyLiked =
        post.likes.findIndex((id) => `${id}` === `${req.user._id}`) === -1
          ? false
          : true;
      if (isAlreadyLiked) {
        let index = post.likes.findIndex((id) => `${id}` === `${req.user._id}`);
        post.likes.splice(index, 1);
        post = await post.save();
        post = await post
          .populate({
            path: "likes",
            select: ["username", "email"],
          })
          .execPopulate();

        res
          .status(200)
          .json({ success: true, message: "Unlike successfully", post });
      } else {
        res
          .status(403)
          .json({ success: false, message: "You haven't like this post" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  });
postRouter
  .route("/:postId/comments")
  .post(authenticate.verifyUser, verify.verifyPostId, async (req, res) => {
    //create new comment type
    try {
      let post = await Post.findById(req.params.postId).exec();
      //check if post exists
      if (post) {
        let commentDoc = new Comment({
          comment: req.body.comment,
          author: req.user._id,
          post: req.params.postId,
        });
        commentDoc = await commentDoc.save();
        post.comments.unshift(commentDoc);
        post = await post.save();
        post = await post
          .populate({
            path: "comments",
            select: ["comment"],
            populate: { path: "author", select: "username -_id" },
          })
          .execPopulate();
        res
          .status(200)
          .json({ success: true, message: "Add comment successfully", post });
      } else {
        res.status(403).json({ success: false, message: "Post not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  });

module.exports = postRouter;
