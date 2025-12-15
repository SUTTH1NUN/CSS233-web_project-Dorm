// backend/routes/repair.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/repairController");
const authenticate = require("../middlewares/authenticate");
const multer = require('multer');
const path = require('path');

// --- Config Multer (การตั้งค่าเก็บไฟล์) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์ใหม่เพื่อไม่ให้ซ้ำ: repair-timestamp.นามสกุลไฟล์
        cb(null, 'repair-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


router.get("/", authenticate, controller.getAllRepairs);
router.put("/:id", authenticate, controller.updateRepairStatus);
router.post("/", authenticate, upload.single('image'), controller.createRepair);
router.get("/my-history", authenticate, controller.getMyRepairs);
router.get("/my-room", authenticate, controller.getMyRoomInfo);

module.exports = router;