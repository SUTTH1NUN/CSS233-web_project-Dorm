// routes/announcement.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/announcementController");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, controller.getAllAnnouncements);
router.get("/admin", authenticate, controller.getAllAnnouncementsForAdmin);
router.post("/", authenticate, controller.createAnnouncement);
router.get("/:id", authenticate, controller.getAnnouncementById);
router.put("/:id", authenticate, controller.updateAnnouncement);
router.delete("/:id", authenticate, controller.deleteAnnouncement);

module.exports = router;