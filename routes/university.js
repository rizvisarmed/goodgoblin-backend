const express = require("express");

const {
  getAllUniversities,
  getAllUniversitiesForDropdown,
  getUniversityById,
  updateUniversityById,
  createNewUniversity,
  deleteUniversityById,
} = require("../controllers");
const { auth, admin, validate } = require("../middlewares");
const {
  createUniversitySchema,
  updateUniversitySchema,
} = require("../validations");

const router = express.Router();

router.get("/", [auth, admin], getAllUniversities);
router.get("/forDropdown", auth, getAllUniversitiesForDropdown);
router.get("/:id", [auth, admin], getUniversityById);
router.post(
  "/",
  [auth, admin, validate(createUniversitySchema)],
  createNewUniversity
);
router.put(
  "/:id",
  [auth, admin, validate(updateUniversitySchema)],
  updateUniversityById
);
router.delete("/:id", [auth, admin], deleteUniversityById);

module.exports = { universityRoutes: router };
