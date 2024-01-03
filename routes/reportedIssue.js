const express = require("express");

const { reportIssue } = require("../controllers");
const { validate, auth } = require("../middlewares");
const { reportIssueSchema } = require("../validations");

const router = express.Router();

router.post("/", [auth, validate(reportIssueSchema)], reportIssue);

module.exports = { reportedIssueRoutes: router };
