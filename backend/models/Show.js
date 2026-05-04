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
  date: {
    type: String,
    default: null,  
  },
  duration: String,
  price: Number,
});

const showSchema = new mongoose.Schema(
  {
    showName: {
      type: String,
      required: true,
    },
    media: [
      {
        type: { type: String, required: true },
        url: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
    gallery: [
      {
        gallerytype: { type: String, required: true },
        galleryurl: { type: String, required: true },
        isActive: { type: Boolean, default: true },
      },
    ],
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

    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },

  { timestamps: true },
);

module.exports = mongoose.model("Show", showSchema);
