// routes/payment.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.getAllPayments);
router.post("/", authenticate, controller.createPayment);
router.get("/billing-info/:room_number", authenticate, controller.getBillingInfoByRoom);
router.get("/:id", authenticate, controller.getPaymentById);
router.put("/:id", authenticate, controller.updatePayment);

module.exports = router;