const gcsSharp = require("multer-sharp");
const gcsOptions = {
	filename: (req, file, cb) => {
		cb(null, req.session.username + "_" + new Date().toISOString());
	},
	bucket: process.env.BUCKET,
	projectId: process.env.PROJECT_ID,
	keyFilename: `${process.env.PWD}/config/${process.env.KEYFILE}`,
	max: true
};

exports.dpUpload = gcsSharp({
	...gcsOptions,
	destination: "dp",
	size: {
		width: 256,
		height: 256,
		option: {
			fit: "inside"
		} 
	},
	toFormat: "png"
});

exports.bannerUpload = gcsSharp({
	...gcsOptions,
	destination: "banner",
	size: {
		width: 1920,
		height: 384,
		option: {
			fit: "inside"
		} 
	},
	toFormat: "png"
});

exports.mediaUpload = gcsSharp({
	...gcsOptions,
	destination: "media",
	toFormat: "png"
});

exports.fields = [
	{
		name: "title",
		maxCount: 1
	},
	{
		name: "body",
		maxCount: 1
	},
	{
		name: "externalLink",
		maxCount: 1
	},
	{
		name: "media",
		maxCount: 3
	},
	{
		name: "isAnnouncement",
		maxCount: 1
	}
];

exports.filter = (req, file, cb) => {
	if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg")
		cb(null, true);
	else
		cb(null, false);
};