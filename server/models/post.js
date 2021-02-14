const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	body: {
		type: String,
	},
	subForum: {
		type: String,
		required: true
	},
	media: [{
		type: String,
	}],
	externalLink: {
		type: String,
	},
	upvotes: {
		type: Number,
		default: 0,
	},
	downvotes: {
		type: Number,
		default: 0,
	},
	comments: [{
		type: Schema.Types.ObjectId,
		ref: "comment"
	}],
	isAnnouncement: {
		type: Boolean,
		default: false
	},
	isPinned: {
		type: Boolean,
		default: false
	},
	OP: {
		type: String,
		required: true,
	}
}, { timestamps: true });

//Export model
module.exports = mongoose.model("post", postSchema);
