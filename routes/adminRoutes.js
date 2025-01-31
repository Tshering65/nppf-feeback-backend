const express = require("express");
const router = express.Router();
const adminController = require("../controllers/AdminController");
const feedbackController = require("../controllers/feedbackController");
const multer = require("multer");
const path = require("path"); // Add this line

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save in 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with unique filename
  },
});

const upload = multer({ storage: storage });

// Admin routes
router.post(
  "/register",
  upload.single("profilePicture"),
  adminController.register
);
router.post("/login", adminController.login);
router.get("/profile/:email", adminController.getProfile);
router.put(
  "/update-admin-profile",
  adminController.uploadProfilePicture,
  adminController.updateAdminProfile
);
router.get("/feedback-counts", feedbackController.getFeedbackCounts);
router.post("/check-old-password", adminController.checkOldPassword);

module.exports = router;
