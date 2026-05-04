const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
    },
    details: Object,
    movieTitle: String,

    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
    },
    hallName: String,

    showDate: Date,

    showTime: String,

    seats: [
      {
        seatId: String,
        category: String,
        price: Number,
        status: {
          type: String,
          enum: ["Booked", "Cancelled"],
          default: "Booked",
        },
      },
    ],
    ticketPrice: Number,
    foodItems: [
      {
        foodId: String,
        name: String,

        quantity: Number, 
        remainingQty: Number, 
        cancelledQty: {
          type: Number,
          default: 0,
        },

        price: Number,

        total: Number, 
        cancelledTotal: {
          type: Number,
          default: 0,
        },

        foodStatus: {
          type: String,
          enum: ["Booked", "Partially Cancelled", "Cancelled"],
          default: "Booked",
        },
      },
    ],
    type: String,
    foodTotal: Number,

    convenienceFee: Number,

    cgst: Number,

    sgst: Number,

    totalAmount: Number,

    paymentId: String,
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Cancelled", "Partially Cancelled"],
      default: "Confirmed",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ["None", "Partially Refunded", "Fully Refunded"],
      default: "None",
    },
    foodRefundAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
