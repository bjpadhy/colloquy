const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const validator = require("validator");
const {
	redisClient
} = require("../config/serverConfig");

exports.profile = async (req, res) => {
	try {
		var userProfile = await User.findOne({
			username: req.params.username,
		}).select("-__v -updatedAt -password");
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json({
		...userProfile._doc,
		createdSubForums: userProfile._doc.createdSubForums.length
	});
};

exports.posts = async (req, res) => {
	try {
		var userPosts = await User.findOne({
			username: req.params.username,
		}).select("createdPosts").populate({
			path: "createdPosts",
			options: {
				sort: {
					"createdAt": -1
				}
			}
		});
		var responseBody = JSON.parse(JSON.stringify(userPosts._doc));
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json(responseBody);
};

exports.subforums = async (req, res) => {
	try {
		var userSubforums = await User.findOne({
			username: req.session.username,
		}).select("createdSubForums joinedSubForums").populate("createdSubForums joinedSubForums", "title members");
		var responseBody = JSON.parse(JSON.stringify(userSubforums._doc));
		responseBody.createdSubForums.forEach(subforum => {
			subforum.members = subforum.members.length;
		});
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json(responseBody);
};

exports.stats = async (req, res) => {
	try {
		var userStats = await User.findOne({
			username: req.session.username,
		}).select("createdPosts createdSubForums joinedSubForums createdAt");
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json({
		...userStats._doc,
		createdPosts: userStats.createdPosts.length,
		createdSubForums: userStats.createdSubForums.length,
		joinedSubForums: userStats.joinedSubForums.length,
	});
};

exports.username = async (req, res) => {
	const username = req.body.username.toLowerCase();
	if (validator.default.isEmpty(username) || !/^\S+$/g.test(username)) {
		res.status(400).json({
			error: "Invalid username",
		});
		return;
	}
	try {
		await User.findOneAndUpdate({
			username: req.session.username,
		}, {
			username: username,
		});
		req.session.username = username;
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json({
		message: "success",
	});
};

exports.DP = async (req, res) => {
	try {
		await User.findOneAndUpdate({
			username: req.session.username,
		}, {
			dpURL: req.file.path,
		});
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json({
		message: "success",
		dpURL: req.file.path
	});
};

exports.banner = async (req, res) => {
	try {
		await User.findOneAndUpdate({
			username: req.session.username,
		}, {
			bannerURL: req.file.path,
		});
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.status(200).json({
		message: "success",
		bannerURL: req.file.path
	});
};

exports.password = async (req, res) => {
	const {
		oldPassword,
		newPassword
	} = req.body;
	if (
		!/^\S+$/g.test(oldPassword) ||
		!/^\S+$/g.test(newPassword) ||
		Object.is(oldPassword, newPassword)
	) {
		res.status(400).json({
			error: "Invalid password",
		});
		return;
	}
	try {
		const fetchedPassword = await User.findOne({
			username: req.session.username,
		}).select("password");
		if (await bcrypt.compare(oldPassword, fetchedPassword.password)) {
			fetchedPassword.password = await bcrypt.hash(newPassword, 12);
			await fetchedPassword.save();
		} else {
			res.status(401).json({
				error: "Incorrect Password"
			});
			return;
		}
	} catch (error) {
		res.status(500).json({
			error: error,
		});
		return;
	}
	res.redirect("/logout");
};

exports.subscribed = async (req, res) => {
	try {
		redisClient.get(`${req.session.username}_subscriptions`, async (error, cachedData) => {
			if (error)
				throw error;
			if (cachedData) {
				res.status(200).json(JSON.parse(cachedData));
				return;
			}
			var subscription = await User.findOne({
				username: req.session.username
			}).select("joinedSubForums").populate("joinedSubForums");
			redisClient.setex(`${req.session.username}_subscriptions`, 3600, JSON.stringify(subscription._doc.joinedSubForums));
			res.status(200).json(subscription._doc.joinedSubForums);
			return;
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};