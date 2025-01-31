const Feedback = require("../models/Feedback");
const json2csv = require("json2csv").parse; // For CSV conversion
const ExcelJS = require("exceljs"); // For Excel file generation

// Submit Feedback
exports.submitFeedback = async (req, res) => {
  const { service_type, emoji_feedback, text_feedback, email, phone } =
    req.body;

  try {
    // Only save text feedback for 'bad' and 'unsatisfactory'
    const feedbackData = {
      service: service_type,
      emoji: emoji_feedback,
      email,
      phone,
    };

    if (emoji_feedback === "bad" || emoji_feedback === "unsatisfactory") {
      feedbackData.feedback = text_feedback; // Store text feedback only for negative reviews
    }

    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();

    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Error submitting feedback:", err);
    res
      .status(500)
      .json({ message: "Error submitting feedback", error: err.message });
  }
};

exports.getFeedbackCounts = async (req, res) => {
  try {
    const feedbackCounts = await Feedback.aggregate([
      {
        $group: {
          _id: "$service", // Group by service field
          count: { $sum: 1 }, // Count entries for each service
        },
      },
    ]);

    // Default counts for all predefined services
    const predefinedServices = ["loan", "pension", "pensioners", "investment"];
    const formattedCounts = predefinedServices.reduce((acc, service) => {
      acc[service] = 0; // Initialize all services with 0
      return acc;
    }, {});

    // Fill in actual counts from database query
    feedbackCounts.forEach(({ _id, count }) => {
      if (formattedCounts.hasOwnProperty(_id)) {
        formattedCounts[_id] = count;
      }
    });

    res.status(200).json(formattedCounts);
  } catch (err) {
    console.error("Error fetching feedback counts:", err);
    res
      .status(500)
      .json({ message: "Error fetching feedback counts", error: err.message });
  }
};

exports.getEmojiCountsByService = async (req, res) => {
  const { service } = req.params;

  try {
    const emojiCounts = await Feedback.aggregate([
      { $match: { service: service } },
      { $group: { _id: "$emoji", count: { $sum: 1 } } },
    ]);

    const response = {
      happy: 0,
      satisfactory: 0,
      unsatisfactory: 0,
      bad: 0,
    };

    emojiCounts.forEach((count) => {
      if (count._id === "happy") response.happy = count.count;
      if (count._id === "satisfactory") response.satisfactory = count.count;
      if (count._id === "unsatisfactory") response.unsatisfactory = count.count;
      if (count._id === "bad") response.bad = count.count;
    });

    res.json(response);
  } catch (err) {
    console.error("Error getting emoji counts:", err);
    res.status(500).json({ message: "Failed to get emoji counts." });
  }
};

// Get Emoji Feedback Counts for All Services and Emoji Types (for Graphs)
exports.getEmojiCountsForGraphs = async (req, res) => {
  try {
    const services = ["pension", "pensioners", "investment", "loan"];
    const emojiTypes = ["good", "satisfactory", "unsatisfactory", "bad"];

    // Initialize the counts object
    const counts = {
      pension: { good: 0, satisfactory: 0, unsatisfactory: 0, bad: 0 },
      pensioners: { good: 0, satisfactory: 0, unsatisfactory: 0, bad: 0 },
      investment: { good: 0, satisfactory: 0, unsatisfactory: 0, bad: 0 },
      loan: { good: 0, satisfactory: 0, unsatisfactory: 0, bad: 0 },
    };

    // Fetch counts for each service and emoji type
    for (let service of services) {
      const serviceFeedbacks = await Feedback.aggregate([
        { $match: { service } },
        { $group: { _id: "$emoji", count: { $sum: 1 } } },
      ]);

      // Populate the counts object for the service
      serviceFeedbacks.forEach(({ _id, count }) => {
        if (emojiTypes.includes(_id)) {
          counts[service][_id] = count;
        }
      });
    }

    res.status(200).json(counts);
  } catch (err) {
    console.error("Error fetching emoji feedback counts:", err);
    res
      .status(500)
      .json({
        message: "Error fetching emoji feedback counts",
        error: err.message,
      });
  }
};

exports.getFeedbackByEmoji = async (req, res) => {
  const { service, emoji } = req.params;

  try {
    const feedbacks = await Feedback.find({ service, emoji });
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback details:", err);
    res.status(500).json({ message: "Failed to get feedback details." });
  }
};

exports.exportFeedbackCSV = async (req, res) => {
  const { service } = req.params;
  try {
    const feedbacks = await Feedback.find({ service });
    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this service" });
    }

    const csv = json2csv(feedbacks, {
      fields: ["service", "emoji", "feedback", "email", "phone", "timestamp"],
    });
    res.header("Content-Type", "text/csv");
    res.attachment(`${service}_feedback.csv`);
    return res.send(csv);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ message: "Error exporting CSV" });
  }
};

exports.exportFeedbackExcel = async (req, res) => {
  const { service } = req.params;
  try {
    const feedbacks = await Feedback.find({ service });
    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ message: "No feedback found for this service" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Feedbacks");
    worksheet.columns = [
      { header: "Service", key: "service", width: 15 },
      { header: "Emoji", key: "emoji", width: 15 },
      { header: "Feedback", key: "feedback", width: 30 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Timestamp", key: "timestamp", width: 25 },
    ];
    feedbacks.forEach((fb) => worksheet.addRow(fb));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${service}_feedback.xlsx`
    );
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting Excel:", error);
    res.status(500).json({ message: "Error exporting Excel" });
  }
};
