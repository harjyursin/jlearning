// routes/payment.js
const express = require("express");
const router = express.Router();
const { createPayment, handleCallback } = require("../controllers/mvolaController");

router.post("/pay", createPayment);
router.post("/callback", handleCallback);

module.exports = router;