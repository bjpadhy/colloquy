const express = require("express");
const router = express.Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../config/documentation.json");
const assertSession = require("../middlewares/assertSession");

// Controller
const auth_controller = require("../controllers/auth_controller");
const home_controller = require("../controllers/home_controller");

// Routes
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(swaggerDocument));
router.get("/home", home_controller.home);
router.get("/search", home_controller.search);
router.post("/register", auth_controller.register);
router.post("/login", auth_controller.login);
router.get("/logout", auth_controller.logout);
router.get("/valid", auth_controller.valid);
router.patch("/resetpassword", auth_controller.resetpassword);
router.get("/mostpopular", assertSession, home_controller.mostpopular);
router.get("/mostrecent", assertSession, home_controller.mostrecent);

module.exports = router;