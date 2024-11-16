const Property = require("../Models/properties.model");
const asyncHandler = require("express-async-handler");
const User = require("../Models/user.model.js");
const mongoose = require("mongoose");

const postproperty = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const propertyData = {
      ...req.body,
      listedBy: userId,
    };

    const property = await Property.create(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error creating property: " + error.message });
  }
});

const getallproperties = asyncHandler(async (req, res) => {
  try {
    const properties = await Property.find();
    res.status(200).json(properties);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching properties: " + error.message });
  }
});

const updateproperty = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating property: " + error.message });
  }
});

const deleteproperty = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    await property.deleteOne();
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error deleting property: " + error.message });
  }
});

const getpropertybyid = asyncHandler(async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching property: " + error.message });
  }
});

const addToCart = asyncHandler(async (req, res) => {
  try {
    const { userId, propertyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (user.cart.includes(property._id)) {
      return res.status(400).json({ error: "Property already in cart" });
    }

    user.cart.push(property._id);
    await user.save();

    res.status(200).json({
      message: "Property added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ error: "Error adding to cart: " + error.message });
  }
});

const removeFromCart = asyncHandler(async (req, res) => {
  try {
    const { userId, propertyId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    user.cart = user.cart.filter(
      (id) => id.toString() !== property._id.toString()
    );
    await user.save();

    res.status(200).json({
      message: "Property removed from cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error removing from cart: " + error.message });
  }
});

const getCart = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ error: "Error fetching cart: " + error.message });
  }
});

const getUserProperties = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;

    // Ensure userId is valid
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const properties = await Property.find({ listedBy: userId })
      .sort({ createdAt: -1 })
      .lean(); // Using lean() for better performance

    // Always send an array, even if empty
    res.status(200).json(properties || []);
  } catch (error) {
    console.error("Error in getUserProperties:", error);
    res.status(500).json({
      error: "Error fetching user properties",
      details: error.message,
    });
  }
});

module.exports = {
  postproperty,
  getallproperties,
  updateproperty,
  deleteproperty,
  getpropertybyid,
  addToCart,
  removeFromCart,
  getCart,
  getUserProperties,
};
