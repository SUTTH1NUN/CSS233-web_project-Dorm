const express = require("express");
const router = express.Router();
const controller = require("../controllers/roomController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.getAllRooms);
router.get("/types", authenticate, controller.getRoomTypes); // ดึงประเภทห้อง
router.post("/", authenticate, controller.createRoom);       // เพิ่มห้อง
router.put("/:id", authenticate, controller.updateRoom);     // แก้ไขห้อง

module.exports = router;