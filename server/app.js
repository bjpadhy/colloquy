// Framework Imports
const express = require("express");
const serverConfig = require("./config/serverConfig");
const mongoose = require("mongoose");
require("dotenv").config();

// Middleware Imports
const session = require("express-session");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const assertSession = require("./middlewares/assertSession");

// Start express server
const app = express();
const PORT = process.env.PORT || 8080;
mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
	app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
}).catch(err => console.log(err));

// Initialize Redis Store
if (process.env.NODE_ENV === "production") {
	app.set("trust proxy", 1); // Trust First Proxy
	serverConfig.redisOptions.cookie.secure = true; // Serve Secure Cookies
}
app.use(session(serverConfig.redisOptions));

// Initialize Middlewares
app.use(compression());
app.use(helmet());
app.use(cors({
	origin: ["http://localhost:8080", "http://localhost:8081", "https://colloquy-site.web.app"],
	methods: ["POST", "PUT", "GET", "PATCH", "HEAD"],
	credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Unprotected API routes
app.use("/", require("./routes/index"));

// Protected API routes
app.use("/u", assertSession, require("./routes/user"));
app.use("/s", assertSession, require("./routes/subForum"));

// Catch all route 404s
app.get("*", function (req, res) {
	res.status(404);
	res.json({
		errorCode: 404,
		errorMessage: "Requested resource cannot be found"
	});
});