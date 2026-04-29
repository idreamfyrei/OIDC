import multer from "multer";
import ApiError from "../utils/api-error.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(ApiError.badRequest("Only image uploads are allowed."));
      return;
    }

    callback(null, true);
  },
});

export const profileImageUpload = upload.single("profileImage");

export default upload;
