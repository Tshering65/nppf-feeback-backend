const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  service: { type: String, required: true },
  emoji: { type: String, required: true },
  feedback: { type: String }, // Optional feedback
  email: { type: String, required: true }, // Ensure email is required
  phone: { type: String, required: true }, // Added phone field
  timestamp: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;
