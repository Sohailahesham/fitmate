const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "exercises/media",
    resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    format: file.mimetype.split("/")[1], // optional
    public_id: file.originalname.split(".")[0],
  }),
});

const upload = multer({ storage });

module.exports = upload;
