// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// GET /api/feedback/all  – public list for website
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("GET FEEDBACK ERROR:", err);
    res.status(500).json({ success: false, message: "Server error while fetching feedback" });
  }
});

module.exports = router;
