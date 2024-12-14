const mongoose = require("mongoose");

const propertyViewSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["interested", "not_interested", "pending"],
    default: "pending",
  },
  remarks: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("PropertyView", propertyViewSchema);
