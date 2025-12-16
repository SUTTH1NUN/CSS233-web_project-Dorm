// routes/payment.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.getAllPayments);
router.post("/", authenticate, controller.createPayment);
router.get("/billing-info/:room_number", authenticate, controller.getBillingInfoByRoom);
// router.put("/:id/status", authenticate, controller.updatePaymentStatus);
router.get("/:id", authenticate, controller.getPaymentById);  // ดึงบิลเดียว
router.put("/:id", authenticate, controller.updatePayment);   // แก้ไขบิล

module.exports = router;