const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const auth = require("../middleware/auth");

// Middleware pentru logging
router.use((req, res, next) => {
  console.log("Contact Route Request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
  });
  next();
});

// Aplicăm middleware-ul de autentificare pentru toate rutele
router.use(auth);

router.get("/", (req, res, next) => {
  console.log("GET /contacts called");
  contactController.getAllContacts(req, res, next);
});
router.post("/", contactController.createContact);
router.put("/:id", contactController.updateContact);
router.delete("/:id", contactController.deleteContact);

module.exports = router;
