const express = require("express");
const router = express.Router();
const {
  postproperty,
  getallproperties,
  updateproperty,
  deleteproperty,
  getpropertybyid,
  addToCart,
  removeFromCart,
  getCart,
} = require("../controllers/property.controller.js");

router.post("/", postproperty);
router.get("/", getallproperties);
router.get("/:id", getpropertybyid);
router.put("/:id", updateproperty);
router.delete("/:id", deleteproperty);
router.post("/cart/add", addToCart);
router.post("/cart/remove", removeFromCart);
router.get("/cart/:userId", getCart);

module.exports = router;
