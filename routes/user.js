const express = require("express");

const {
  getAllUsers,
  getCurrentUserDetails,
  getPrepAiStatus,
  getCollegesStatus,
  getEssaysStatus,
  deleteUserById,
  submitOrientation,
  updateProfilePicture,
  deleteProfilePicture,
  updateName,
  updatePassword,
  updateUserDetails,
} = require("../controllers");
const { upload } = require("../utils");
const { auth, admin, validate } = require("../middlewares");
const { nameSchema, passwordSchema } = require("../validations");

const router = express.Router();

router.get("/", [auth, admin], getAllUsers);
router.get("/me", auth, getCurrentUserDetails);
router.get("/prepAiStatus", auth, getPrepAiStatus);
router.get("/getCollegesStatus", auth, getCollegesStatus);
router.get("/getEssaysStatus", auth, getEssaysStatus);
router.post("/submitOrientation", auth, submitOrientation);
router.post(
  "/updateProfilePicture",
  auth,
  upload.single("image"),
  updateProfilePicture
);
router.patch("/updateUserDetails", auth, updateUserDetails);
router.patch("/updateName", auth, validate(nameSchema), updateName);
router.patch("/updatePassword", auth, validate(passwordSchema), updatePassword);
router.delete("/deleteProfilePicture", auth, deleteProfilePicture);
router.delete("/:id", [auth, admin], deleteUserById);

module.exports = { userRoutes: router };
