module.exports = async (req, res, next) => {
	// Assert User Session
	if (!req.session.username) {
		const error = new Error("Unauthorized");
		error.error = "Please login to continue";
		res.status(401).json(error);
		return;
	}
	next();
};