const SubForum = require("../models/subForum");
const User = require("../models/user");

module.exports = async (req, res, next) => {
	const id = await SubForum.findOne({
		title: req.params.title
	});
	id?req.query.subForumID = id._id:req.query.subForumID = undefined;
	const user_id = await User.findOne({
		username: req.session.username
	});
	user_id?req.query.userID = user_id._id:req.query.userID = undefined;
	if (!req.query.subForumID || !req.query.userID) {
		const error = new Error("Resource Mapping Error");
		error.error = "Resource not found";
		res.status(404).json(error);
		return;
	}
	next();
};