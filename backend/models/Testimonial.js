const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  name: { type: String },
  message: { type: String },
  profileimage: { type: String },
  designation: { type: String },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Testimonial", TestimonialSchema);
