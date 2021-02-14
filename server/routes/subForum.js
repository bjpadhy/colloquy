const express = require("express");
const router = express.Router();

// Imports for file upload
const multer = require("multer");
const fileUpload = require("../middlewares/formUpload");
const dpUpload = multer({ storage: fileUpload.dpUpload, fileFilter: fileUpload.filter }).single("image");
const bannerUpload = multer({ storage: fileUpload.bannerUpload, fileFilter: fileUpload.filter }).single("image");

// Controller
const subforum_controller = require("../controllers/subforum_controller");

// Middleware
const idMapper = require("../middlewares/idMapper");

// Routes
router.post("/create", subforum_controller.create);
router.use("/post", require("./post"));
router.get("/:title", idMapper, subforum_controller.subforumHome);
router.post("/:title/join", idMapper, subforum_controller.join);
router.patch("/:title/edit/dp", idMapper, dpUpload, subforum_controller.DP);
router.patch("/:title/edit/banner", idMapper, bannerUpload, subforum_controller.banner);
router.patch("/:title/edit/description", idMapper, subforum_controller.description);
router.patch("/:title/edit/rules", idMapper, subforum_controller.rules);
router.patch("/:title/edit/privacy", idMapper, subforum_controller.privacy);

module.exports = router;