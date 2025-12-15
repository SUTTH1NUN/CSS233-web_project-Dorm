// routes/paymentRoutes.js (ตัวอย่าง)
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
// สมมติว่ามี middleware สำหรับตรวจสอบสิทธิ์ (authMiddleware)
const authenticate = require("../middlewares/authenticate");
// Payments API: /api/payments

// [1] สร้างใบแจ้งหนี้
router.post('/', authenticate, paymentController.createPayment);

// [2] ดึงรายการทั้งหมด (พร้อม Search/Filter)
router.get('/', authenticate, paymentController.getAllPayments);

// [3] อัปเดตสถานะ (Mark Paid/Unpaid)
router.put('/:id/status', authenticate, paymentController.updatePaymentStatus);

// Tenant API: /api/tenants/room/:room_number/billing-info
// [4] ดึงข้อมูลมิเตอร์ล่าสุดและค่าเช่า (ต้องใช้ในไฟล์ routes/tenantRoutes.js หรือ routes/paymentRoutes.js)
// ถ้าใช้ชื่อตามที่คุณเขียนใน Frontend คือ TENANT_API:
router.get('/room/:room_number/billing-info', authenticate, paymentController.getLatestMeterAndFee); 

module.exports = router;