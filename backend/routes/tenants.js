const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");

// Path: /api/tenants/...
router.post("/register", tenantController.registerTenant);
router.get("/", tenantController.getAllTenants);
router.get('/:id', tenantController.getTenantById);
router.put('/:id', tenantController.updateTenant);

module.exports = router;