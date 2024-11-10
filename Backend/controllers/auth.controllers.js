const asyncHandler = require("express-async-handler");
const User = require("../Models/user.model.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = asyncHandler(async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      phno,
      role,
      isLoggedIn,
      profilePicture,
    } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide username, email, and password" });
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(409)
        .json({ error: "User already exists with that email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phno,
      role,
      isLoggedIn,
      profilePicture,
    });

    if (user) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.status(201).json({
        _id: user._id,
        name: user.username,
        email: user.email,
        phno: user.phno,
        pic: user.profilePicture,
        role: user.role,
        token: token,
      });
    } else {
      res.status(400).json({ error: "Failed to create user" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error during signup: " + error.message });
  }
});

const signin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      res.status(200).json({
        _id: user._id,
        name: user.username,
        email: user.email,
        phno: user.phno,
        pic: user.profilePicture,
        role: user.role,
        token: token,
      });
    } else {
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error during signin: " + error.message });
  }
});

const getusers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users: " + error.message });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, phno, profilePicture } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.phno = phno || user.phno;
    user.profilePicture = profilePicture || user.profilePicture;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.username,
      email: updatedUser.email,
      phno: updatedUser.phno,
      pic: updatedUser.profilePicture,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user: " + error.message });
  }
});

module.exports = { signup, signin, getusers, updateUser };
