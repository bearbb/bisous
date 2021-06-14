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
      console.log(comment);
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
          let postDoc = await Post.findById(comment.post).exec();
          //Delete commentDoc on comments collection
          const resp = await Comment.deleteOne({ _id: comment._id });
          let commentIndex = postDoc.comments.findIndex(
            (cm) => cm === `${req.params.commentId}`
          );
          //Delete commentId on comments arr on post data
          postDoc.comments.splice(commentIndex, 1);
          postDoc = await comment.save();
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
