const url = require("url");
const session = require("express-session");
const redis = require("redis");
const redisStore = require("connect-redis")(session);

var redisClient;
var redisServerOptions;
if (process.env.NODE_ENV === "production") {
	const redisURL = url.parse(process.env.REDISCLOUD_URL);
	redisClient = redis.createClient(redisURL.port, redisURL.hostname, {
		no_ready_check: true
	});
	redisClient.auth(redisURL.auth.split(":")[1]);
	redisServerOptions = {
		secret: `${process.env.SESSION_SECRET}`,
		saveUninitialized: true,
		resave: false,
		store: new redisStore({
			client: redisClient
		}),
		cookie: {
			sameSite: "none",
		}
	};
} else {
	redisClient = redis.createClient();
	redisServerOptions = {
		secret: `${process.env.SESSION_SECRET}`,
		saveUninitialized: true,
		resave: false,
		store: new redisStore({
			client: redisClient
		})
	};
}

exports.redisOptions = redisServerOptions;

exports.redisClient = redisClient;