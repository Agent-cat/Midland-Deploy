const express = require("express");
const router = express.Router();
const {
  postfeedback,
  getfeedback,
} = require("../controllers/feedback.controller.js");

router.post("/", postfeedback);
router.get("/", getfeedback);
module.exports = router;
