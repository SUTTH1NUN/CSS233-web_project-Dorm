const express = require("express");
const router = express.Router();
const controller = require("../controllers/roomController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.getAllRooms);
router.get("/types", authenticate, controller.getRoomTypes);
router.post("/", authenticate, controller.createRoom);
router.put("/:id", authenticate, controller.updateRoom);

module.exports = router;