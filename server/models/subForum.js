const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subForumSchema = new Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String,
		required: true
	},
	dpURL: {
		type: String,
		default: "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fnone.svg?alt=media&token=f8e70342-4b7d-445c-85dc-50b8f3029bc7"
	},
	bannerURL: {
		type: String,
		default: "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fbanner.png?alt=media&token=d9e8a353-9f93-4ba9-851f-3c842bed8b5a"
	},
	isPrivate: {
		type: Boolean,
		default: false
	},
	rules: {
		type: [String]
	},
	posts: [{
		type: Schema.Types.ObjectId,
		ref: "post"
	}],
	members: {
		type: [String]
	},
	OP: {
		type: String,
		required: true
	},

}, { timestamps: true });

//Export model
module.exports = mongoose.model("subForum", subForumSchema);

