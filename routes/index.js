const { authRoutes } = require("./auth");
const { userRoutes } = require("./user");
const { universityRoutes } = require("./university");
const { questionRoutes } = require("./question");
const { answerRoutes } = require("./answer");
const { deadlineRoutes } = require("./deadline");
const { essayRoutes } = require("./essay");
const { studentUniversityRoutes } = require("./studentUniversity");
const { sectionRoutes } = require("./section");
const { emailRoutes } = require("./email");
const { paymentRoutes } = require("./payment");
const { webhookRoutes } = require("./webhook");
const { planRoutes } = require("./plan");
const { transactionRoutes } = require("./transaction");
const { scriptsRoutes } = require("./scripts");
const { reportedIssueRoutes } = require("./reportedIssue");
const { essentialsRoutes } = require("./essentials");

module.exports = {
  authRoutes,
  userRoutes,
  universityRoutes,
  questionRoutes,
  answerRoutes,
  deadlineRoutes,
  essayRoutes,
  studentUniversityRoutes,
  sectionRoutes,
  emailRoutes,
  paymentRoutes,
  webhookRoutes,
  planRoutes,
  transactionRoutes,
  scriptsRoutes,
  reportedIssueRoutes,
  essentialsRoutes,
};
