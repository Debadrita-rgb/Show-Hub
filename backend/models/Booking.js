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
      },
    ],
    ticketPrice: Number,

    foodItems: [
  {
    foodId: String,
    name: String,
    quantity: Number,
    price: Number,
    total: Number
  }
],
    type: String,
    foodTotal: Number,

    convenienceFee: Number,

    cgst: Number,

    sgst: Number,

    totalAmount: Number,

    paymentId: String,

    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
