const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  artist_name: String,
  designation: String,
  artist_image: String,
});

const locationSchema = new mongoose.Schema({
  locationName: String,
  theaterName: String,
  startTime: String,
  date: String,
  duration: String,
  price: Number,
});

const showSchema = new mongoose.Schema(
  {
    showName: {
      type: String,
      required: true,
    },
    showImage: String,
    showVideoEmbedURL: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    subCategory: [String],
    isMultipleLocation: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },

    locations: [locationSchema],

    languages: [{ type: String, required: true }],

    ageLimit: String,

    description: String,

    artists: [artistSchema],

    startDate: Date,
    endDate: Date,
  },

  { timestamps: true },
);

module.exports = mongoose.model("Show", showSchema);
