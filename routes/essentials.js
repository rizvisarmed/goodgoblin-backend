const express = require("express");

const {
  transformInspire,
  clarityAndCoherence,
  compellingStorytelling,
  conciseness,
  essayCoaching,
  expandInspire,
  grammarSpelling,
  promptRelevance,
  structuralStrength,
  summarizeInspire,
} = require("../controllers");
const {
  auth,
  isUserEssay,
  validate,
  canDoEssential,
} = require("../middlewares");
const { transformEssaySchema } = require("../validations");

const router = express.Router();

router.get(
  "/clarityCoherence/:id",
  [auth, isUserEssay, canDoEssential],
  clarityAndCoherence
);
router.get(
  "/engagingStorytelling/:id",
  [auth, isUserEssay, canDoEssential],
  compellingStorytelling
);
router.get(
  "/conciseness/:id",
  [auth, isUserEssay, canDoEssential],
  conciseness
);
router.get(
  "/promptRelevance/:id",
  [auth, isUserEssay, canDoEssential],
  promptRelevance
);
router.get(
  "/structuralStrength/:id",
  [auth, isUserEssay, canDoEssential],
  structuralStrength
);
router.get(
  "/grammarSpelling/:id",
  [auth, isUserEssay, canDoEssential],
  grammarSpelling
);
router.get(
  "/essayCoaching/:id",
  [auth, isUserEssay, canDoEssential],
  essayCoaching
);
router.post(
  "/transformInspire/:id",
  [auth, validate(transformEssaySchema), isUserEssay, canDoEssential],
  transformInspire
);
router.post(
  "/expandInspire/:id",
  [auth, validate(transformEssaySchema), isUserEssay, canDoEssential],
  expandInspire
);
router.post(
  "/summarizeInspire/:id",
  [auth, validate(transformEssaySchema), isUserEssay, canDoEssential],
  summarizeInspire
);

module.exports = { essentialsRoutes: router };
