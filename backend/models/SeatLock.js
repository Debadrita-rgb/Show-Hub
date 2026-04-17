const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema(
  {
    movieId: mongoose.Schema.Types.ObjectId,
    theaterId: mongoose.Schema.Types.ObjectId,

    showDate: Date,
    showTime: String,

    seats: [
      {
        seatId: String,
      },
    ],

    userId: mongoose.Schema.Types.ObjectId,

    expiresAt: {
      type: Date,
      required: true,
    },
    lockedBy: mongoose.Schema.Types.ObjectId,
    lockStatus: {
      type: String,
      enum: ["InActive", "Active"],
      default: "Active",
    },
  },
  { timestamps: true },
);

// TTL index
// seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("SeatLock", seatLockSchema);
