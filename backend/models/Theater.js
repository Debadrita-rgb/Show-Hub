const mongoose = require("mongoose");

const seatCategorySchema = new mongoose.Schema({
  seat_name: {
    type: String,
    required: true,
  },
  totalRows: {
    type: Number,
    required: true,
  },
  seatsPerRow: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const hallSchema = new mongoose.Schema({
  hall_name: {
    type: String,
    required: function () {
      return this.parent().isMultiple;
      // Required only if theater has multiple halls
    },
  },
  seatCategories: {
    type: [seatCategorySchema],
    required: true,
  },
});

const theaterSchema = new mongoose.Schema(
  {
    location_name: {
      type: String,
      required: true,
    },
    theater_name: {
      type: String,
      required: true,
    },
    isMultiple: {
      type: Boolean,
      default: false,
    },
    halls: {
      type: [hallSchema],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    foodItems: [
      {
        title: { type: String },
        foodCategory: {
          type: String,
          enum: [
            "Popcorn",
            "Snacks",
            "Combos",
            "Beverages",
          ],
        },
        imageUrl: { type: String },
        foodPrice: { type: Number },
      },
    ],
    isPreMeal: {
      type: Boolean,
      default: false,
    },
    isParkingFacility: {
      type: Boolean,
      default: false,
    },
    isFoodCourt: {
      type: Boolean,
      default: false,
    },
    isWheelChairFacility: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Theater", theaterSchema);
