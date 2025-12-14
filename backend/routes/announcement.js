// routes/announcement.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/announcementController");

// 👇 1. เรียกไฟล์ Middleware ที่เราเพิ่งสร้าง
const authenticate = require("../middlewares/authenticate");

// 👇 2. ใส่คั่นตรงกลาง (แปลว่า: ก่อนจะดู/เพิ่ม/ลบ ต้องผ่าน authenticate ก่อนนะ)
router.get("/", authenticate, controller.getAllAnnouncements);
router.get("/admin", authenticate, controller.getAllAnnouncementsForAdmin);
router.post("/", authenticate, controller.createAnnouncement);
router.get("/:id", authenticate, controller.getAnnouncementById);
router.put("/:id", authenticate, controller.updateAnnouncement);
router.delete("/:id", authenticate, controller.deleteAnnouncement);

module.exports = router;