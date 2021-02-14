const SubForum = require("../models/subForum");
const User = require("../models/user");
const Post = require("../models/post");
const {
	redisClient
} = require("../config/serverConfig");

exports.home = async (req, res) => {
	if (!req.session.username) {
		const feed = await SubForum.find({
			isPrivate: false
		}).select("dpURL title posts").populate({
			path: "posts",
			options: {
				sort: {
					"createdAt": -1
				}
			}
		});
		res.status(200).json(feed);
		return;
	}
	const feed = await SubForum.find({
		members: req.session.username
	}).select("dpURL title posts").populate({
		path: "posts",
		options: {
			sort: {
				"createdAt": -1
			}
		}
	});
	res.status(200).json(feed);
};

exports.search = async (req, res) => {
	try {
		redisClient.get("searchResult", async (error, cachedData) => {
			if (error)
				throw error;
			if (cachedData) {
				res.status(200).json(JSON.parse(cachedData));
				return;
			}
			const searchResult = [];
			const userList = await User.find().select("username dpURL -_id");
			userList.forEach(user => searchResult.push({
				...user._doc,
				title: user._doc.username,
				type: "user",
				description: "Colloquy User"
			}));
			const subForumList = await SubForum.find().select("title dpURL description -_id");
			subForumList.forEach(subforum => searchResult.push({
				...subforum._doc,
				type: "subforum"
			}));
			redisClient.setex("searchResult", 36000, JSON.stringify(searchResult));
			res.status(200).json(searchResult);
			return;
		});
	} catch (error) {
		res.status(500).json({
			error: error
		});
		return;
	}
};

exports.mostpopular = async (req, res) => {
	try {
		redisClient.get("mostPopular", async (error, cachedData)=>{
			if (error)	throw error;
			if (cachedData) {
				res.status(200).json(JSON.parse(cachedData));
				return;
			}
			var pipeline = [
				{
					"$project": {
						"title": 1,
						"body": 1,
						"subForum": 1,
						"media": 1,
						"externalLink": 1,
						"upvotes": 1,
						"downvotes": 1,
						"comments": 1,
						"isAnnouncement": 1,
						"isPinned": 1,
						"OP": 1,
						"popularity": {
							"$add": ["$upvotes", "$downvotes", {
								$size: "$comments"
							}]
						}
					}
				},
				{
					"$sort": {
						"popularity": -1
					}
				}
			];
			const mostPopularPosts = await Post.aggregate(pipeline).limit(10);
			redisClient.setex("mostPopular", 36000, JSON.stringify(mostPopularPosts));
			res.status(200).json(mostPopularPosts);
		});
	} catch (error) {
		res.status(500).json(error);
	}
};

exports.mostrecent = async (req, res) => {
	try {
		redisClient.get("mostRecentPosts", async (error, cachedData) => {
			if(error) throw error;
			if(cachedData) {
				res.status(200).json(JSON.parse(cachedData));
				return;
			}
			const mostRecentPosts = await Post.find().sort({"createdAt": -1}).limit(10);
			redisClient.setex("mostRecentPosts", 36000, JSON.stringify(mostRecentPosts));
			res.status(200).json(mostRecentPosts);
		});
	} catch (error) {
		res.status(500).json(error);
	}
};