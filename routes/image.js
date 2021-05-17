const express = require("express");
const Image = require("../models/image");
const authenticate = require("../authenticate");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname + "-" + Date.now());
  },
});

const imageFileFilter = (req, file, cb) => {
  let fileExtensionRegEx = /\.(jpg|jpeg|png)/;
  if (!file.originalname.match(fileExtensionRegEx)) {
    return cb(new Error("Only image file is allow"), false);
  } else {
    cb(null, true);
  }
};

const singleImageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
}).single("imageFile");

const imageRouter = express.Router();

imageRouter.route("/").post(
  authenticate.verifyUser,
  // upload.single("imageFile"),
  async (req, res, next) => {
    try {
      singleImageUpload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading.
          if (err.message == "Only image file is allow") {
            res.status(403).json({ success: false, message: err.message });
          } else {
            res.status(500).json({
              success: false,
              message: "Something went wrong, please try again",
            });
          }
        } else if (err) {
          res.status(500).json({
            success: false,
            message: "Something went wrong, please try again",
          });
        } else {
          // Everything went fine.
          console.log("Thing going well");
          //create new Image doc on mongodb
          let imageDoc = new Image({
            path: `images/${req.file.filename}`,
          });
          imageDoc.author = req.user._id;
          imageDoc = await imageDoc.save();
          //find that imageDoc to check (incase =))
          let image = await Image.findById(imageDoc._id).lean();
          if (!image) {
            res
              .status(500)
              .json({ success: false, message: "Something wrong" });
          } else {
            res
              .status(200)
              .json({ success: true, message: "Upload successfully", image });
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Something went wrong, please try again",
      });
    }
  }
);

module.exports = imageRouter;
