const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: [
    {
      type: String,
      required: true,
    },
  ],
  movieimage: { type: String, required: true },
  backgroundUrl: { type: String, required: true },
  language: [{ type: String, required: true }],
  totalTiming: { type: String, required: true },
  releasedDate: { type: Date, required: true },
  movieDescription: { type: String, required: true },
  format: [
    {
      type: String,
      enum: [
        "2D",
        "3D",
        "4DX",
        "IMAX 3D",
        "4DX",
        "DOLBY CINEMA 2D",
        "ICE",
        "2D SCREEN X",
      ],
      required: true,
    },
  ],
  crew: [
    {
      name: { type: String, required: true },
      dpimageUrl: { type: String, required: true },
      designation: { type: String, required: true },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRecommended: {
    type: Boolean,
    default: true,
  },
  casting: [
    {
      castname: { type: String, required: true },
      castimageURL: { type: String },
      inmoviecastname: { type: String, required: true },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: String,
  },
  trailerlink: {
    type: String
  }
});
module.exports = mongoose.model("Movie", MovieSchema);
