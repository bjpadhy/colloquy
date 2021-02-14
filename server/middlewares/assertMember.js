const SubForum = require("../models/subForum");

module.exports = async (req, res, next) => {
	const subForum = await SubForum.findById(req.query.subForumID);
	if (!subForum.members.includes(req.session.username)) {
		const error = new Error("Forbidden");
		error.error = "Please join subForum to create post";
		res.status(403).json(error);
		return;
	}
	next();
};