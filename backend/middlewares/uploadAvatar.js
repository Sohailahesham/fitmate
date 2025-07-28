// middlewares/uploadAvatar.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "users/avatars",
    resource_type: "image",
    format: file.mimetype.split("/")[1],
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
  }),
});

const uploadAvatar = multer({ storage: avatarStorage });

module.exports = uploadAvatar;
