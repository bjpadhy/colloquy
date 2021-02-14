const express = require("express");
const router = express.Router();

// Imports for form upload
const multer = require("multer");
const formUpload = require("../middlewares/formUpload");
const mediaUpload = multer({ storage: formUpload.mediaUpload }).fields(formUpload.fields);

// Controller
const post_controller = require("../controllers/post_controller");

router.get("/", post_controller.fetch);
router.post("/create", mediaUpload, post_controller.create);
router.post("/comment", post_controller.comment);
router.post("/vote", post_controller.vote);
router.patch("/:title/editstatus", post_controller.editStatus); 

module.exports = router;