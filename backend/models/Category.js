const mongoose = require("mongoose");
const SubCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },
});
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String },
  type: {
    type: String,
    required: true,
    enum: ["Movie", "Show"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subCategories: [SubCategorySchema],
});
module.exports = mongoose.model("Category", CategorySchema);
