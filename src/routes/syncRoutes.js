const express = require("express");
const router = express.Router();
const syncService = require("../services/syncService");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    await syncService.syncContacts(req.user.userId);
    res.json({ message: "Sync completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
