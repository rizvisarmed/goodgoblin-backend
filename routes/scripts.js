const express = require("express");

const {
  uploadAllUniversities,
  uploadAllEssayCategories,
  uploadAllPromptQuestions,
  uploadAllSystemGuidance,
  uploadAllStripePlans,
} = require("../controllers");
const { admin, auth } = require("../middlewares");

const router = express.Router();

router.post("/uploadAllUniversities", [auth, admin], uploadAllUniversities);
router.post(
  "/uploadAllEssayCategories",
  [auth, admin],
  uploadAllEssayCategories
);
router.post(
  "/uploadAllPromptQuestions",
  [auth, admin],
  uploadAllPromptQuestions
);
router.post("/uploadAllSystemGuidance", [auth, admin], uploadAllSystemGuidance);
router.post("/uploadAllStripePlans", [auth, admin], uploadAllStripePlans);

module.exports = { scriptsRoutes: router };
