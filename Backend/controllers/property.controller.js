const Property = require("../Models/properties.model");
const asyncHandler = require("express-async-handler");
const User = require("../Models/user.model.js");
const mongoose = require("mongoose");
const PropertyView = require("../Models/propertyView.model");

const postproperty = asyncHandler(async (req, res) => {
  const existingProperty = await Property.findOne({
    name: req.body.name,
    location: req.body.location,
    address: req.body.address,
  });

  if (existingProperty) {
    return res.status(409).json({
      message: "Property already exists",
      property: existingProperty,
    });
  }

  const property = await Property.create(req.body);

  if (property) {
    res.status(201).json({
      message: "Property created successfully",
      property: property,
    });
  } else {
    res.status(400);
    throw new Error("Invalid property data");
  }
});

const getallproperties = asyncHandler(async (req, res) => {
  const properties = await Property.find();
  res.status(200).json(properties);
});

const updateproperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
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
});

const deleteproperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  await property.deleteOne();
  res.status(200).json({ message: "Property deleted successfully" });
});

const getpropertybyid = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.status(200).json(property);
});

const addToCart = asyncHandler(async (req, res) => {
  const { userId, propertyId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  if (user.cart.includes(property._id)) {
    res.status(400);
    throw new Error("Property already in cart");
  }

  user.cart.push(property._id);
  await user.save();

  res.status(200).json({
    message: "Property added to cart successfully",
    cart: user.cart,
  });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { userId, propertyId } = req.body;

  // Validate userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Invalid user ID");
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  user.cart = user.cart.filter(
    (id) => id.toString() !== property._id.toString()
  );
  await user.save();

  res.status(200).json({
    message: "Property removed from cart successfully",
    cart: user.cart,
  });
});

const getCart = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).populate("cart");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user.cart);
});

const checkExistingView = asyncHandler(async (req, res) => {
  const { propertyId, userId } = req.params;

  const property = await Property.findById(propertyId);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const existingView = await PropertyView.findOne({
    property: propertyId,
    user: userId,
  });

  res.json({ hasViewed: !!existingView });
});

const postViews = asyncHandler(async (req, res) => {
  const { userId, phoneNumber } = req.body;
  const propertyId = req.params.propertyId;

  // Check if view already exists
  const existingView = await PropertyView.findOne({
    propertyId,
    userId,
  });

  if (existingView) {
    return res.status(200).json(existingView);
  }

  // Create new view record with phone number
  const view = await PropertyView.create({
    propertyId,
    userId,
    phoneNumber,
    viewedAt: new Date(),
  });

  // Update property isViewed status and add view reference
  await Property.findByIdAndUpdate(propertyId, {
    isViewed: true,
    $push: { views: view._id },
  });

  res.status(201).json(view);
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
  checkExistingView,
  postViews,
};
