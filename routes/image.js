const express = require("express");
const Image = require("../models/image");
const authenticate = require("../authenticate");
const multer = require("multer");
const path = require("path");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    let oriName = file.originalname.split(".");
    let imgExtension = oriName[oriName.length - 1];
    cb(null, Date.now() + "." + imgExtension);
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
            res.status(200).json({
              success: true,
              message: "Upload successfully",
              imageId: image._id,
            });
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
imageRouter.route("/:imageId").get(async (req, res, next) => {
  try {
    const options = {
      root: "images",
      dotfiles: "deny",
      headers: {
        "x-timestamp": Date.now(),
        "x-sent": true,
      },
    };
    //get image doc
    let imgDoc = await Image.findById(req.params.imageId).lean();
    if (imgDoc) {
      // const fileName = req.params.fileName;
      const path = imgDoc.path;
      const fileName = path.split("/")[1];
      // res.status(200).json({ path });
      //TODO: check if image exist in database (img record)
      res.sendFile(fileName, options, function (err) {
        if (err) {
          next(err);
        } else {
          console.log("Sent:", fileName);
        }
      });
    } else {
      res.status(403).json({ success: false, message: "Document not existed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong, please try again",
      success: false,
    });
  }

  // let imgPath =
});

module.exports = imageRouter;
