const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
	body: {
		type: String,
		required: true
	},
	OP: {
		type: Schema.Types.ObjectId,
		ref: "user",
		required: true
	}
}, { timestamps: true });

//Export model
module.exports = mongoose.model("comment", commentSchema);