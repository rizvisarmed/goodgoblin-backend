const express = require("express");

const { checkoutSessionWebhook, testWebhook } = require("../controllers");

const router = express.Router();

router.get("/testWebhook/:priceId", express.json(), testWebhook);
router.post(
  "/checkoutSessionWebhook",
  express.raw({ type: "application/json" }),
  checkoutSessionWebhook
);

module.exports = { webhookRoutes: router };
