const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
const validator = require("validator");
const User = require("../models/user");
const SubForum = require("../models/subForum");
const {
	redisClient
} = require("../config/serverConfig");

exports.create = async (req, res) => {
	// Find user and check if privileged to create subforum
	const user = await User.findOne({
		username: req.session.username
	}).select("_id isPrivileged createdSubForums joinedSubForums");
	if (!user.isPrivileged) {
		res.status(403).json({
			error: "Forbidden. User not authorized for action"
		});
		return;
	}

	// Validate request body
	const validatedData = validateBody(req.body);
	if (validatedData.errors.length > 0) {
		const error = new Error("Invalid Input");
		error.error = validatedData.errors;
		res.status(400).json(error);
		return;
	}
	const {
		title,
		description,
		isPrivate,
		rules
	} = validatedData.data;

	// Create and save subforum
	const subforum = new SubForum({
		title: title,
		description: description,
		isPrivate: isPrivate,
		rules: rules,
		members: [req.session.username],
		OP: req.session.username
	});

	try {
		var savedData = await subforum.save();
		await user.updateOne({
			$addToSet: {
				createdSubForums: savedData._id,
				joinedSubForums: savedData._id
			}
		});
		const cacheResult = await redisClient.get("searchResult");
		if(cacheResult) await redisClient.del("searchResult");
		res.status(200).json({
			savedData
		});
		return;
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};

exports.subforumHome = async (req, res) => {
	// Fetch subforum
	try {
		const subForum = await SubForum.findById(req.query.subForumID).populate({
			path: "posts",
			options: {
				sort: {
					"createdAt": -1
				}
			}
		});
		if (!subForum) {
			res.status(404).json({
				error: "SubForum does not exist."
			});
		} else {
			if (subForum.OP === req.session.username || !subForum.isPrivate || subForum.members.includes(req.session.username)) {
				var responseBody = JSON.parse(JSON.stringify(subForum._doc));
				res.status(200).json({
					...responseBody
				});
				return;
			} else {
				res.status(200).json({
					...subForum._doc,
					posts: undefined
				});
				return;
			}
		}
	} catch (error) {
		res.status(500).json({
			error: error
		});
	}
};

exports.join = async (req, res) => {
	// Update subforum and user objects
	try {
		await User.findByIdAndUpdate(req.query.userID, {
			$addToSet: {
				joinedSubForums: req.query.subForumID
			}
		});
		await SubForum.findByIdAndUpdate(req.query.subForumID, {
			$addToSet: {
				members: req.session.username
			}
		});
		const cacheResult = await redisClient.get(`${req.session.username}_subscriptions`);
		if(cacheResult)	await redisClient.del(`${req.session.username}_subscriptions`);
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json({
		message: "success"
	});
};

exports.banner = async (req, res) => {
	// Update banner URL
	try {
		await SubForum.findByIdAndUpdate(req.query.subForumID, {
			bannerURL: req.file.path
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json({
		message: "success",
		bannerURL: req.file.path
	});
};

exports.DP = async (req, res) => {
	// Update dp URL
	try {
		await SubForum.findByIdAndUpdate(req.query.subForumID, {
			dpURL: req.file.path
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json({
		message: "success",
		dpURL: req.file.path
	});
};

exports.description = async (req, res) => {

	const validatedData = validateBody(req.body);
	if (validatedData.errors.length > 0) {
		const error = new Error("Invalid Input");
		error.error = validatedData.errors;
		res.status(400).json(error);
		return;
	}
	const data = validatedData.data.description;
	try {
		const oldSubForum = await SubForum.findById(req.query.subForumID).select("description OP");
		if (oldSubForum.OP === req.session.username) {
			await oldSubForum.updateOne({
				description: data
			});
			res.status(200).json({
				message: "success"
			});
			return;
		}
		res.status(403).json({
			error: "Only OP can edit subforum"
		});
		return;
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};

exports.rules = async (req, res) => {
	var rules = [];
	req.body.rules.forEach(rule => {
		validator.escape(rule);
		rules.push(rule);
	});
	try {
		const subForum = await SubForum.findById(req.query.subForumID).select("OP rules");
		if (subForum.OP === req.session.username) {
			await subForum.updateOne({
				rules: rules
			});
			res.status(200).json({
				message: "success"
			});
			return;
		}
		res.status(403).json({
			error: "Only OP can edit subforum"
		});
		return;
	} catch (error) {
		res.status(500).json({
			message: "success"
		});
	}
};

exports.privacy = async (req, res) => {
	try {
		const subForumPrivacy = await SubForum.findById(req.query.subForumID).select("isPrivate OP");
		if (subForumPrivacy.OP === req.session.username) {
			const newPrivacyState = !subForumPrivacy.isPrivate;
			await subForumPrivacy.updateOne({
				isPrivate: newPrivacyState
			});
			res.status(200).json({
				message: "success"
			});
			return;
		}
		res.status(403).json({
			error: "Only OP can edit subforum"
		});
		return;
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};

function validateBody({
	title = "",
	description,
	isPrivate,
	rules
}) {
	const errorMessages = [];
	if (title) {
		if (!/^\S+$/g.test(title) || validator.isEmpty(title))
			errorMessages.push("Title cannot contain spaces.");
	}
	if (validator.isEmpty(description))
		errorMessages.push("Description cannot be empty.");

	// Return errors and validated data
	return {
		errors: errorMessages,
		data: {
			title: title,
			description: description,
			isPrivate: isPrivate,
			rules: rules
		}
	};
}