const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const validator = require("validator");
var bcrypt = require("bcryptjs");
const User = require("../models/user");
const randomString = (length = 9) => Math.random().toString(20).substr(2, length);
const mailgun = require("mailgun-js");
const {
	redisClient
} = require("../config/serverConfig");

exports.register = async (req, res) => {
	// Validate request body
	const validation = validateBody(req.body);
	if (validation.errors.length > 0) {
		const error = new Error("Invalid Input");
		error.error = validation.errors;
		res.status(400).json(error);
		return;
	}

	const email = validation.data.email;
	const name = validation.data.name;
	const batch = req.body.batch;
	// Create username by combining first name and ID
	const username = name.split(" ", 2)[0].toLowerCase().concat(`_${email.split("@",2)[0]}`);

	// Existing User Check
	const existingUser = await User.findOne({
		username: username
	});
	if (existingUser) {
		const error = new Error("Registration Error");
		error.error = "User already exists";
		res.status(409).json(error);
		return;
	}

	// Hash Password and create User
	const hashedPw = await bcrypt.hash(validation.data.password, 12);
	const checkPrivilege = RegExp(/(\d{9,})@daiict\.ac\.in/g);
	var isPrivileged = checkPrivilege.test(email) ? false : true;
	const gender = req.body.gender;
	var dpURL;
	if (gender === "Male")
		dpURL = "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fmale.svg?alt=media&token=bc9af30d-deaa-4979-9388-f9d35b195d5d";
	else if (gender === "Female")
		dpURL = "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Ffemale.svg?alt=media&token=9b4a3f9f-ff59-4013-a0ae-85bb36c6a426";
	else if (gender === "Transgender")
		dpURL = "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Ftrans.svg?alt=media&token=f4ae28ad-2474-4b6a-905f-0ac44761db23";
	else
		dpURL = "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fnone.svg?alt=media&token=f8e70342-4b7d-445c-85dc-50b8f3029bc7";
	const user = new User({
		batch: batch,
		username: username,
		email: email,
		password: hashedPw,
		name: name,
		gender: gender,
		dpURL: dpURL,
		// Set alphanumeric email to be privileged user
		isPrivileged: isPrivileged
	});

	// Save and return created User
	try {
		var createdUser = await user.save();
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	const cacheResult = await redisClient.get("searchResult");
	if (cacheResult) await redisClient.del("searchResult");
	res.status(200).json({
		...createdUser._doc,
		_id: createdUser._id.toString()
	});
};

exports.login = async (req, res) => {
	if (req.session.username) {
		const userSession = await User.findOne({
			username: req.session.username
		});
		res.status(200).json(userSession);
		return;
	}

	// Validate request body
	const validation = validateBody(req.body);
	if (validation.errors.length > 0) {
		const error = new Error("Invalid Input");
		error.error = validation.errors;
		res.status(400).json(error);
		return;
	}

	const email = validation.data.email;
	const password = validation.data.password;

	// Existing User Check
	const user = await User.findOne({
		email: email
	});
	if (!user) {
		const error = new Error("Login Error");
		error.error = "Please register to login";
		res.status(404).json(error);
		return;
	}

	// Password matching
	const isCorrect = await bcrypt.compare(password, user.password);
	if (!isCorrect) {
		const error = new Error("Login Error");
		error.error = "Incorrect Password";
		res.status(401).json(error);
		return;
	}

	req.session.username = user.username;
	res.status(200).json(user);
};

exports.resetpassword = async (req, res) => {
	const username = validator.escape(req.query.username);
	var resetUser = await User.findOne({
		username: username
	});
	if (!resetUser) {
		const error = new Error("Reset Error");
		error.error = "Please register first";
		res.status(404).json(error);
		return;
	}
	const mg = mailgun({
		apiKey: process.env.MAIL_API_KEY,
		domain: process.env.MAIL_DOMAIN
	});
	const random_string = randomString(10);
	const hashed_password = await bcrypt.hash(random_string, 12);
	console.log(random_string);
	console.log(hashed_password);

	var data = {
		from: "Project Colloquy support@projectcolloquy.tech",
		to: `${resetUser.email}`,
		subject: "Colloquy Password Reset",
		template: "new_password",
		"h:X-Mailgun-Variables": JSON.stringify({
			new: `${random_string}`
		})
	};
	mg.messages().send(data, async function (error) {
		if (error) {
			console.log(error);
			res.status(500).json({
				error: error
			});
			return;
		}
		try {
			resetUser.password = hashed_password;
			await resetUser.save();
			res.status(200).json({
				message: "success"
			});
			return;
		} catch (error) {
			res.status(500).json({
				error: error
			});
			return;
		}
	});
};

exports.logout = async (req, res) => {
	if (!req.session.username) {
		res.status(400).json({
			error: "User not logged In"
		});
		return;
	}
	req.session.destroy((err) => {
		if (err)
			res.status(500).json({
				error: err
			});
		res.status(200).json({
			message: "success"
		});
	});
};

exports.valid = async (req, res) => {
	res.status(200).json({
		valid: req.session.username ? true : false
	});
};

function validateBody(req) {
	var password = req.password.toLowerCase();
	var username = req.username;
	var email = req.email;
	var name = req.name;
	const errorMessages = [];

	// Check if email belongs to DAIICT domain
	if (email) {
		email = email.toLowerCase();
		if (!/(\w+)@daiict\.ac\.in/g.test(email) && !/(\w+)@projectcolloquy\.tech/g.test(email))
			errorMessages.push("Email must belong to DAIICT domain");
		if (/\d/g.test(name))
			errorMessages.push("Name cannot be alphanumeric");
	}

	// Check if password contains spaces
	if (!/^\S+$/g.test(password) || !/^\S+$/g.test(username))
		errorMessages.push("Input string cannot contain spaces");

	const data = {
		name: name,
		username: username,
		email: email,
		password: password
	};

	// Return errors and validated data
	return {
		errors: errorMessages,
		data: data
	};
}