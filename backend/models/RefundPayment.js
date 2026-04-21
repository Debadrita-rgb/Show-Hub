const mongoose = require("mongoose");

const refundPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },

    paymentId: {
      type: String,
    },

    seats: [
      {
        seatId: String,
        category: String,
        price: Number,
      },
    ],

    foodItems: [
      {
        foodId: String,
        name: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],

    refundAmount: {
      type: Number,
      required: true,
    },

    refundType: {
      type: String,
      enum: ["Partial", "Full", "Food"],
      required: true,
    },

    refundStatus: {
      type: String,
      enum: ["Completed", "Failed"],
      default: "Completed",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("RefundPayment", refundPaymentSchema);
