const express = require("express");
const router = express.Router();

// Imports for file upload
const multer = require("multer");
const fileUpload = require("../middlewares/formUpload");
const dpUpload = multer({ storage: fileUpload.dpUpload, fileFilter: fileUpload.filter }).single("image");
const bannerUpload = multer({ storage: fileUpload.bannerUpload, fileFilter: fileUpload.filter }).single("image");

// Controller
const profile_controller = require("../controllers/profile_controller");

// Routes
router.get("/subscribed", profile_controller.subscribed);
router.get("/stats", profile_controller.stats);
router.get("/posts/:username", profile_controller.posts);
router.get("/subforums", profile_controller.subforums);
router.post("/edit/password", profile_controller.password);
router.patch("/edit/dp", dpUpload, profile_controller.DP);
router.patch("/edit/banner", bannerUpload, profile_controller.banner);
router.get("/:username", profile_controller.profile);

module.exports = router;