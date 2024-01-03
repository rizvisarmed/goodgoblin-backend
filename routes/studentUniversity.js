const express = require("express");

const {
  getAllStudentUniversities,
  // getStudentUniversityById,
  updateStudentUniversityField,
  getStudentUniversitiesTypeStats,
  createNewStudentUniversity,
  deleteStudentUniversityById,
  getSelectedCollegesCount,
} = require("../controllers");
const { auth, validate } = require("../middlewares");
const {
  createStudentUniversitySchema,
  updateStudentUniversityFieldSchema,
} = require("../validations");

const router = express.Router();

router.get("/", auth, getAllStudentUniversities);
router.get(
  "/getStudentUniversitiesTypeStats",
  auth,
  getStudentUniversitiesTypeStats
);
router.get("/getSelectedCollegesCount", auth, getSelectedCollegesCount);
router.post(
  "/",
  [auth, validate(createStudentUniversitySchema)],
  createNewStudentUniversity
);
router.patch(
  "/:userUniversityDeadlineId",
  [auth, validate(updateStudentUniversityFieldSchema)],
  updateStudentUniversityField
);
router.delete("/:id", auth, deleteStudentUniversityById);

module.exports = { studentUniversityRoutes: router };
