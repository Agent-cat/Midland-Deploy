const Feedback = require("../Models/feedback.model.js");

const postfeedback = async (req, res) => {
  try {
    const { username, feedback } = req.body;

    if (!username || !feedback) {
      return res
        .status(400)
        .json({ error: "Username and feedback are required" });
    }

    const newFeedback = await Feedback.create({ username, feedback });
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error submitting feedback: " + error.message });
  }
};

const getfeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("username", "username email profilePicture")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching feedback: " + error.message });
  }
};

module.exports = { postfeedback, getfeedback };
