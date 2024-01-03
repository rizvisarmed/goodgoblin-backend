const express = require("express");

const { getTransactionsByUserId } = require("../controllers");
const { auth } = require("../middlewares");

const router = express.Router();

router.get("/", auth, getTransactionsByUserId);

module.exports = { transactionRoutes: router };
