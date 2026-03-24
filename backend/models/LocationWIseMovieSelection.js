const mongoose = require("mongoose");

const locationWiseMovieSelectionSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    location: {
      type: String,
      required: true,
    },
    language: [{ type: String, required: true }],

    theater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },

    hall_name: {
      type: String,
      required: function () {
        return this.isMultiple === true;
      },
    },

    isMultiple: {
      type: Boolean,
      default: false,
    },

    shows: [
      {
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "LocationWiseMovieSelection",
  locationWiseMovieSelectionSchema,
);
