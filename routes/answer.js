const express = require("express");

const {
  getAllAnswers,
  getSelectedAdjectivesAnswers,
  getAnswerById,
  getAnswerByQuestionId,
  createAnswerForSelectedAdjectives,
  // deleteAnswerById,
  createOrUpdateAnswer,
} = require("../controllers");
const { auth, admin, validate } = require("../middlewares");
const {
  createUpdateAnswerSchema,
  createAnswerForSelectedAdjectivesSchema,
} = require("../validations");

const router = express.Router();

router.get("/", auth, getAllAnswers);
router.get("/getSelectedAdjectivesAnswers", auth, getSelectedAdjectivesAnswers);
router.get("/:id", [admin, auth], getAnswerById);
router.get("/questions/:questionId", auth, getAnswerByQuestionId);
router.post(
  "/createNewAnswerForSelectedAdjectives",
  [auth, validate(createAnswerForSelectedAdjectivesSchema)],
  createAnswerForSelectedAdjectives
);
router.post(
  "/createOrUpdateAnswer",
  [auth, validate(createUpdateAnswerSchema)],
  createOrUpdateAnswer
);
// router.delete("/:id", [auth, admin], deleteAnswerById);

module.exports = { answerRoutes: router };
