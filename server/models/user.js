const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
		unique: true
	},
	gender: {
		type: String,
		required: true,
		default: "none"
	},
	email: {
		type: String,
		maxlength: 50,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true,
		minlength: 2,
		maxlength: 50
	},
	batch: {
		type: String,
		default: "DA"
	},
	dpURL: {
		type: String,
		default: "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fdp.webp?alt=media&token=85588a68-aa02-4b9b-ad07-4565855e76fc"
	},
	bannerURL: {
		type: String,
		default: "https://firebasestorage.googleapis.com/v0/b/colloquy-api.appspot.com/o/defaults%2Fbanner.png?alt=media&token=d9e8a353-9f93-4ba9-851f-3c842bed8b5a"
	},
	isPrivileged: {
		type: Boolean,
		required: true
	},
	createdPosts: [{
		type: Schema.Types.ObjectId,
		ref: "post"
	}],
	joinedSubForums: [{
		type: Schema.Types.ObjectId,
		ref: "subForum"
	}],
	createdSubForums: [{
		type: Schema.Types.ObjectId,
		ref: "subForum"
	}]
}, { timestamps: true });

//Export model
module.exports = mongoose.model("user", userSchema);
