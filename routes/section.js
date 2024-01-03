const express = require("express");

const { createNewSection, getAllSections } = require("../controllers");
const { auth, admin, validate } = require("../middlewares");
const { createSectionSchema } = require("../validations");

const router = express.Router();

router.get("/", auth, getAllSections);
router.post(
  "/",
  [auth, admin, validate(createSectionSchema)],
  createNewSection
);

module.exports = { sectionRoutes: router };
