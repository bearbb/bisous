const express = require("express");
const authenticate = require("../authenticate");
const { Notification, NotificationByOwner } = require("../models/notification");

const notiRouter = express.Router();

notiRouter.route("/").get(authenticate.verifyUser, async (req, res, next) => {
  try {
    //get all noti from notiByOwner
    let notiDoc = await NotificationByOwner.findOne({
      owner: req.user._id,
    });
    res.status(200).json({ notiDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

notiRouter
  .route("/markAsRead/:notiId")
  .post(authenticate.verifyUser, async (req, res, next) => {
    try {
      //find the noti by its id
      let notiDoc = await Notification.findById(req.params.notiId);
      //update read status
      notiDoc.isRead = true;
      notiDoc = await notiDoc.save();
      res.status(200).json({ notiDoc });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false });
    }
  });

module.exports = notiRouter;
