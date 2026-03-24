const mongoose = require("mongoose");

const LanguageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // rating: {
  //   type: String,
  // },
  // trailerlink: {
  //   type: String,
  // },
});
module.exports = mongoose.model("Language", LanguageSchema);
