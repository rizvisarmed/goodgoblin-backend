const express = require("express");

const { getPlans, getPlanIds } = require("../controllers");
const { auth } = require("../middlewares");

const router = express.Router();

router.get("/", auth, getPlans);
router.get("/getPlanIds", auth, getPlanIds);

module.exports = { planRoutes: router };
