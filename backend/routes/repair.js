const express = require("express");
const router = express.Router();
const controller = require("../controllers/repairController");
//const authenticate = require("../middlewares/authenticate");

// --- Config Multer สำหรับอัปโหลดไฟล์ ---
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // อย่าลืมสร้างโฟลเดอร์ uploads ไว้ที่ root project
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
// กรองเฉพาะไฟล์รูปภาพ
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed'), false);
};

const upload = multer({ storage, fileFilter });
// ----------------------------------------


// 1. ผู้เช่าแจ้งซ่อม (เพิ่ม upload.single('image'))
// ชื่อ field 'image' ต้องตรงกับที่ Frontend ส่งมาใน FormData
// router.post("/", authenticate, upload.single('image'), controller.createRepair);
router.post("/", controller.createRepair);
// 2. แอดมินดูทั้งหมด
//router.get("/", authenticate, controller.getAllRepairs);

// 3. แอดมินอัปเดตสถานะ
//router.put("/:id", authenticate, controller.updateRepairStatus);

// 4. ลบรายการ
//router.delete("/:id", authenticate, controller.deleteRepair);

module.exports = router;