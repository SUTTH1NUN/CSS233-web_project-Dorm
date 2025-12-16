// routes/public.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/publicController");

router.get("/available-rooms", controller.getAvailableRooms);

module.exports = router;