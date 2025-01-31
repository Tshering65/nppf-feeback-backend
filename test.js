async function testFeedbackCounts() {
  try {
    const feedbackCounts = await Feedback.aggregate([
      {
        $group: {
          _id: { $toLower: "$service" }, // Normalize service names to lowercase
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("Aggregated feedback data:", feedbackCounts);
  } catch (err) {
    console.error("Error fetching feedback counts:", err);
  }
}

testFeedbackCounts();
