const Contact = require("../Models/contact.model");
const asyncHandler = require("express-async-handler");

const createContact = asyncHandler(async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Error creating contact: " + error.message });
  }
});

const getContacts = asyncHandler(async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate("propertyId")
      .populate("userId")
      .sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching contacts: " + error.message });
  }
});

const updateContactStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error updating contact status: " + error.message });
  }
});

module.exports = { createContact, getContacts, updateContactStatus };
