const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieSession = require("cookie-session");

const { errorHandler } = require("./middlewares");
const {
  authRoutes,
  userRoutes,
  universityRoutes,
  deadlineRoutes,
  essayRoutes,
  questionRoutes,
  answerRoutes,
  sectionRoutes,
  studentUniversityRoutes,
  emailRoutes,
  paymentRoutes,
  webhookRoutes,
  planRoutes,
  transactionRoutes,
  scriptsRoutes,
  reportedIssueRoutes,
  essentialsRoutes,
} = require("./routes");
require("./passport");

const app = express();

app.use(
  cookieSession({
    name: "google-auth-session",
    keys: ["cyberwolve"],
    maxAge: 60 * 60 * 100,
  })
);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://app.goodgoblin.ai",
      "https://www.dev-app.goodgoblin.ai",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//webhooks
app.use("/api/webhooks", webhookRoutes);

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
//     return res.status(200).json({});
//   }
//   next();
// });

//routes middleware

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/deadlines", deadlineRoutes);
app.use("/api/essays", essayRoutes);
app.use("/api/studentUniversities", studentUniversityRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/scripts", scriptsRoutes);
app.use("/api/reportedIssues", reportedIssueRoutes);
app.use("/api/essentials", essentialsRoutes);

app.use(errorHandler);

module.exports = { app };
