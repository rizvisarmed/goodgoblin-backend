const express = require("express");

const {
  getAllQuestions,
  // getQuestionById,
  // updateQuestionById,
  // createNewQuestion,
  // deleteQuestionById,
  getAllQuestionsBySectionId,
} = require("../controllers");
const { auth, admin, validate } = require("../middlewares");
// const {
//   createQuestionSchema,
//   updateQuestionSchema,
// } = require("../validations");

const router = express.Router();

router.get("/", [auth], getAllQuestions);
router.get("/:sectionId", auth, getAllQuestionsBySectionId);
// router.get("/:id", [auth, admin], getQuestionById);
// router.post(
//   "/",
//   [auth, admin, validate(createQuestionSchema)],
//   createNewQuestion
// );
// router.put(
//   "/:id",
//   [auth, admin, validate(updateQuestionSchema)],
//   updateQuestionById
// );
// router.delete("/:id", [auth, admin], deleteQuestionById);

module.exports = { questionRoutes: router };
