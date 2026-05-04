const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["home", "show-all-movies", "testimonial", "contact", "feedback"],
    required: true,
  },
  page_banner_image: [
    {
      imageURL: { type: String, required: true },
      isActive: { type: Boolean, default: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", BannerSchema);
