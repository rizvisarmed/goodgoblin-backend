const express = require("express");
const passport = require("passport");

const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  sendValidTokenResponse,
  resetPassword,
  onSocialLoginSuccess,
  onSocialLoginFailed,
} = require("../controllers");
const { validate, checkTokenValidity } = require("../middlewares");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} = require("../validations");
const { ADMIN, STUDENT } = require("../constants");

const router = express.Router();

router.get("/google", (req, res, next) => {
  req.session.priceId = req.query.priceId;
  passport.authenticate("google")(req, res, next);
});
router.get("/google/callback", (req, res, next) => {
  const priceId = req.session.priceId;
  passport.authenticate("google", {
    successRedirect: `/api/login/success${
      priceId ? `?priceId=${priceId}` : ""
    }`,
    failureRedirect: "/api/login/failed",
  })(req, res, next);
});
router.get("/login/success", onSocialLoginSuccess);
router.get("/login/failed", onSocialLoginFailed);
router.get("/verifyEmail", verifyEmail);
router.post("/register", validate(registerSchema), (req, res, next) => {
  register(req, res, next, STUDENT);
});
router.post("/adminRegister", validate(registerSchema), (req, res, next) => {
  register(req, res, next, ADMIN);
});
router.post("/login", validate(loginSchema), login);
router.post(
  "/admin/login",
  [
    (req, res, next) => {
      req.isAdmin = true;
      next();
    },
    validate(loginSchema),
  ],
  login
);
router.post("/forgotPassword", validate(forgotPasswordSchema), forgotPassword);
router.post("/checkToken", checkTokenValidity, sendValidTokenResponse);
router.post(
  "/resetPassword",
  checkTokenValidity,
  validate(resetPasswordSchema),
  resetPassword
);

module.exports = { authRoutes: router };
