const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback"); // Adjust path if necessary
const {
  submitFeedback,
  getFeedbackCounts,
  getEmojiCountsByService,
  exportFeedbackCSV,
  exportFeedbackExcel,
  getEmojiCountsForGraphs,
} = require("../controllers/feedbackController");

// Routes
router.post("/", submitFeedback);
router.get("/feedback-counts", getFeedbackCounts); // Error if function is undefined
// Get Emoji Counts for a Specific Service
router.get("/:service/emoji-counts", getEmojiCountsByService);

router.get("/loan/feedback-details/:emoji", async (req, res) => {
  try {
    const { emoji } = req.params;
    const feedbacks = await Feedback.find({
      service: "loan",
      emoji: emoji,
    }).sort({ timestamp: -1 });

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this emoji" });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    res.status(500).json({ message: "Error fetching feedback details" });
  }
});

router.get("/pension/feedback-details/:emoji", async (req, res) => {
  try {
    const { emoji } = req.params;
    const feedbacks = await Feedback.find({
      service: "pension",
      emoji: emoji,
    }).sort({ timestamp: -1 });

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this emoji" });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    res.status(500).json({ message: "Error fetching feedback details" });
  }
});

router.get("/pensioners/feedback-details/:emoji", async (req, res) => {
  try {
    const { emoji } = req.params;
    const feedbacks = await Feedback.find({
      service: "pensioners",
      emoji: emoji,
    }).sort({ timestamp: -1 });

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this emoji" });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    res.status(500).json({ message: "Error fetching feedback details" });
  }
});

router.get("/investment/feedback-details/:emoji", async (req, res) => {
  try {
    const { emoji } = req.params;
    const feedbacks = await Feedback.find({
      service: "investment",
      emoji: emoji,
    }).sort({ timestamp: -1 });

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this emoji" });
    }

    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback details:", error);
    res.status(500).json({ message: "Error fetching feedback details" });
  }
});

router.get("/emoji-counts-for-graphs", getEmojiCountsForGraphs);

router.get("/:service/export-csv", exportFeedbackCSV);
router.get("/:service/export-excel", exportFeedbackExcel);

module.exports = router;
