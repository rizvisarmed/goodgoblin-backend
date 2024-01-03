const express = require("express");

const { createCheckoutSessionSchema } = require("../validations");
const {
  createCheckoutSession,
  getUserSubscriptionDetail,
  cancelUserSubscription,
} = require("../controllers");
const { auth, validate } = require("../middlewares");

const router = express.Router();

router.get("/", auth, getUserSubscriptionDetail);
router.post(
  "/createCheckoutSession",
  [auth, validate(createCheckoutSessionSchema)],
  createCheckoutSession
);
router.post("/cancelUserSubscription", auth, cancelUserSubscription);

module.exports = { paymentRoutes: router };
