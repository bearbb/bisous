const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/comment");
const authenticate = require("../authenticate");
const verify = require("../verify");

const commentRouter = express.Router();

commentRouter
  .route("/:commentId")
  .get(verify.verifyCommentId, async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.commentId).exec();
      if (comment) {
        comment = await comment
          .populate({ path: "author", select: ["username", "email"] })
          .execPopulate();
        res.status(200).json({ success: true, comment });
      } else {
        res.status(403).json({ success: false, message: "Comment not found" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  })
  .post((req, res) => {
    res.status(405).json({
      success: false,
      message: "This route does not support POST operation",
    });
  })
  .put(authenticate.verifyUser, verify.verifyCommentId, async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.commentId).exec();
      if (comment) {
        //check ownership
        if (`${comment.author}` === `${req.user._id}`) {
          //check if body contain comment to update
          if (req.body.comment && typeof req.body.comment == "string") {
            comment.comment = req.body.comment;
            comment = await comment.save();
            res.status(200).json({ success: true, comment });
          } else {
            res.status(403).json({ success: false, message: "Missing data" });
          }
        } else {
          res.status(401).json({ success: false, message: "Unauthorized" });
        }
      } else {
        res.status(403).json({ success: false, message: "Comment not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  })
  .delete(authenticate.verifyUser, verify.verifyCommentId, async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.commentId).exec();
      if (comment) {
        if (`${comment.author}` === `${req.user._id}`) {
          const resp = await Comment.deleteOne({
            _id: req.params.postId,
          }).lean();
          console.log(resp);
          res
            .status(200)
            .json({ success: true, message: "Delete successfully" });
        } else {
          res.status(401).json({ success: false, message: "Unauthorized" });
        }
      } else {
        res.status(403).json({ success: false, message: "Comment not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong please try again",
      });
    }
  });

module.exports = commentRouter;
