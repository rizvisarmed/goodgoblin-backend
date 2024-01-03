const express = require("express");

const {
  getAllDeadlines,
  getDeadlineById,
  updateDeadlineById,
  createNewDeadline,
  deleteDeadlineById,
} = require("../controllers");
const { auth, admin, validate } = require("../middlewares");
const {
  createDeadlineSchema,
  updateDeadlineSchema,
} = require("../validations");

const router = express.Router();

router.get("/", [auth, admin], getAllDeadlines);
router.get("/:id", [auth, admin], getDeadlineById);
router.post(
  "/",
  [auth, admin, validate(createDeadlineSchema)],
  createNewDeadline
);
router.put(
  "/:id",
  [auth, admin, validate(updateDeadlineSchema)],
  updateDeadlineById
);
router.delete("/:id", [auth, admin], deleteDeadlineById);

module.exports = { deadlineRoutes: router };
