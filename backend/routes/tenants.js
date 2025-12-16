const express = require("express");
const router = express.Router();
const controller = require("../controllers/tenantController");

const authenticate = require("../middlewares/authenticate");

router.post("/", authenticate, controller.registerTenant);
router.get("/:id", authenticate, controller.getTenantById);
router.put("/:id", authenticate, controller.updateTenant);
router.get("/", controller.getAllTenants);

module.exports = router;