const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const authenticate = require("../middlewares/authenticate");

router.get("/stats", authenticate, controller.getDashboardStats);

module.exports = router;