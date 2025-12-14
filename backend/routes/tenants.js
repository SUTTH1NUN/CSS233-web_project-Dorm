const express = require("express");
const router = express.Router();
const controller = require("../controllers/tenantController");

// 👇 1. เรียก Middleware มา
const authenticate = require("../middlewares/authenticate");

// 👇 2. เอา authenticate ไปคั่นไว้ทุกอันที่อยากล็อค
router.get("/", authenticate, controller.getAllTenants);
router.post("/", authenticate, controller.registerTenant);
router.get("/:id", authenticate, controller.getTenantById);
router.put("/:id", authenticate, controller.updateTenant);

module.exports = router;