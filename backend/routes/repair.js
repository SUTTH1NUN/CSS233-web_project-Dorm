// backend/routes/repair.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/repairController");
const authenticate = require("../middlewares/authenticate");
const multer = require('multer');
const path = require('path');

// --- Config Multer ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'repair-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- Routes ---
router.get("/my-history", authenticate, controller.getMyRepairs);
router.get("/my-room", authenticate, controller.getMyRoomInfo);
router.get("/", authenticate, controller.getAllRepairs);
router.post("/", authenticate, upload.single('image'), controller.createRepair);
router.get("/:id", authenticate, controller.getRepairById); 
router.put("/:id", authenticate, controller.updateRepairStatus);

module.exports = router;