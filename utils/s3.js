const S3 = require("aws-sdk/clients/s3");
const multer = require("multer");
const crypto = require("crypto");

const {
  AWS_BUCKET_NAME: bucketName,
  AWS_BUCKET_REGION: region,
} = require("../config");

const s3 = new S3({
  region,
});

const uploadImage = async (base64Image, studentId) => {
  const buffer = Buffer.from(base64Image, "base64");

  const params = {
    Bucket: bucketName,
    Body: buffer,
    ContentType: "image/jpeg",
    ContentEncoding: "base64",
    Key: `${studentId}-${crypto.randomBytes(20).toString("hex")}`,
  };

  return s3.upload(params).promise();
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 0.8 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpeg, .jpg, and .png formats are allowed!"), false);
    }
  },
});

const deleteImage = async (key) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  return s3.deleteObject(params).promise();
};

module.exports = {
  uploadImage,
  upload,
  deleteImage,
};
