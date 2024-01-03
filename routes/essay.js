const express = require("express");

const {
  createNewEssay,
  getAllSelectedUniversitiesEssays,
  getAllSelectedUniversitiesWithEssaysForDashboard,
  getAllSelectedEssays,
  getEssaySubmissionById,
  submitEssay,
  generateRealEssay,
  // generateFinalEssay,
  updateEssay,
  saveEssay,
  markFavoriteEssay,
  updatePersonalizeEssay,
  scanEssayWithAi,
  getEssaySubmissionsStats,
  getEssaySubmissionStatsForCalender,
  getAllSystemGuidanceByIds,
  getThingsBeforeGeneratingFinalEssay,
  markEssayCompletedOrInCompleted,
} = require("../controllers");
const {
  auth,
  admin,
  validate,
  isUserEssay,
  verifyEssayGen,
  canDoEssential,
} = require("../middlewares");
const {
  createEssaySchema,
  submitEssaySchema,
  saveEssaySchema,
  generateEssaySchema,
  generateFinalEssaySchema,
  markFavoriteEssaySchema,
  updatePersonalizeEssaySchema,
  getAllSystemGuidanceByIdsSchema,
} = require("../validations");

const router = express.Router();

router.get("/", auth, getAllSelectedUniversitiesEssays);
router.get(
  "/getAllSelectedUniversitiesWithEssaysForDashboard",
  auth,
  getAllSelectedUniversitiesWithEssaysForDashboard
);
router.get("/essaySubmissionsStats", auth, getEssaySubmissionsStats);
router.get(
  "/getEssaySubmissionStatsForCalender",
  auth,
  getEssaySubmissionStatsForCalender
);
router.get("/getAllSelectedEssays", auth, getAllSelectedEssays);
router.get("/getStudentSubmittedEssay/:id", auth, getEssaySubmissionById);
router.post("/scanEssayWithAi/:id", [auth, isUserEssay], scanEssayWithAi);
router.post("/", [auth, admin, validate(createEssaySchema)], createNewEssay);
router.post("/submitEssay", [auth, validate(submitEssaySchema)], submitEssay);
router.post(
  "/generateEssay",
  [auth, validate(generateEssaySchema), isUserEssay],
  generateRealEssay
);
// router.post(
//   "/generateEssay",
//   [auth, validate(generateEssaySchema), isUserEssay],
//   generateRealEssay
// );
router.post(
  "/getThingsBeforeGeneratingFinalEssay",
  [auth, validate(generateFinalEssaySchema), isUserEssay],
  getThingsBeforeGeneratingFinalEssay
);
router.post(
  "/saveEssay",
  [auth, validate(saveEssaySchema), isUserEssay, canDoEssential],
  saveEssay
);
router.post("/updateEssay", verifyEssayGen, updateEssay);
router.post(
  "/getAllSystemGuidanceByIds",
  validate(getAllSystemGuidanceByIdsSchema),
  getAllSystemGuidanceByIds
);
router.patch(
  "/markFavoriteEssay/:id",
  [auth, validate(markFavoriteEssaySchema), isUserEssay],
  markFavoriteEssay
);
router.patch(
  "/updatePersonalizeEssay/:id",
  [auth, validate(updatePersonalizeEssaySchema), isUserEssay],
  updatePersonalizeEssay
);
router.patch(
  "/markEssayCompletedOrInCompleted/:id",
  [auth, isUserEssay],
  markEssayCompletedOrInCompleted
);

module.exports = { essayRoutes: router };
