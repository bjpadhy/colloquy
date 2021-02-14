const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const User = require("../models/user");
const Post = require("../models/post");
const SubForum = require("../models/subForum");
const Comment = require("../models/comment");

exports.create = async (req, res) => {
	try {
		const body = JSON.parse(JSON.stringify(req.body));
		let media = [];
		const files = JSON.parse(JSON.stringify(req.files)).media;
		if (files) {
			files.forEach(item => {
				media.push(item.path);
			});
		}
		const post = new Post({
			...body,
			media: media,
			OP: req.session.username
		});
		var savedPost = await post.save();
		await User.findOneAndUpdate({
			username: req.session.username
		}, {
			$addToSet: {
				createdPosts: savedPost._id
			}
		});
		await SubForum.findOneAndUpdate({
			title: body.subForum
		}, {
			$addToSet: {
				posts: savedPost._id
			}
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json(savedPost);
};

exports.fetch = async (req, res) => {
	try {
		var post = await Post.findById(req.query.postid).populate({
			path: "comments",
			populate: {
				path: "OP",
				select: "dpURL username"
			}
		});
	} catch (error) {
		if (!post) {
			res.status(404).json({
				error: "Post not found"
			});
			return;
		}
		res.status(500).json({
			error: error
		});
		return;
	}
	res.status(200).json(post);
};

exports.comment = async (req, res) => {
	try {
		const user_Ref = await User.findOne({
			username: req.session.username
		}).select("dpURL username _id");
		const comment = new Comment({
			body: req.body.body,
			OP: user_Ref._id
		});
		const newComment = await comment.save();
		await Post.findByIdAndUpdate(req.query.postid, {
			$addToSet: {
				comments: newComment._id
			}
		});
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

exports.vote = async (req, res) => {
	try {
		const type = req.query.vote;
		var updateObject = {};
		if (type === "up") updateObject = {
			$inc: {
				upvotes: 1
			}
		};
		else if (type === "upOld") updateObject = {
			$inc: {
				upvotes: -1,
				downvotes: 1
			}
		};
		else if (type === "upNew") updateObject = {
			$inc: {
				upvotes: 1,
				downvotes: -1
			}
		};
		else updateObject = {
			$inc: {
				downvotes: 1
			}
		};
		await Post.findByIdAndUpdate(req.query.postid, updateObject);
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

exports.editStatus = async (req, res) => {
	try {
		const subOP = await SubForum.findOne({title: req.params.title}).select("OP");
		if (req.session.username === subOP.OP) {
			const post = await Post.findById(req.query.postid);
			const newPinState = !post.isPinned;
			await post.updateOne({
				isPinned: newPinState
			});
			res.status(200).json({
				message: "success"
			});
			return;
		}
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};