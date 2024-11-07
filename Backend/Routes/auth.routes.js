const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  getusers,
  updateUser,
} = require("../controllers/auth.controllers.js");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/users", getusers);
router.put("/update/:id", updateUser);
module.exports = router;
