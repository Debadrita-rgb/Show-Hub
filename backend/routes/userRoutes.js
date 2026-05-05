const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
require("dotenv").config();
const bcrypt = require("bcrypt");

// Importing User model
const jsonwebtoken = require("../middleware/auth")("USER");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Movie = require("../models/Movie");
const Gallery = require("../models/Gallery");
const Contact = require("../models/Contact");
const Review = require("../models/Review");
const Banner = require("../models/Banner");
const Language = require("../models/Language");
const Category = require("../models/Category");
const LocationWiseMovie = require("../models/LocationWIseMovieSelection");
const Theater = require("../models/Theater");
const Show = require("../models/Show");
const SeatLock = require("../models/SeatLock");
const RefundPayment = require("../models/RefundPayment");

const razorpay = require("../api/razorpay");
const formatDate = require("../utils/dateHelper");

const sendBookingEmail = require("../services/bookingemailService.js");
const sendCancelEmail = require("../services/sendCancelEmail.js");
const sendotpEmail = require("../services/sendotpEmail.js");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const otpStore = {};

//Google signup
router.post("/send-otp", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = {
      otp,
      name,
      password,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };
    const user = await User.findOne({ email });
    const safeUser = user || { name: name || "User", email };

    setImmediate(() => {
      sendotpEmail({ user: safeUser, otp });
    });

    // await sgMail.send(msg);

    res.json({ success: true });
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(
        record.password || "google_user",
        10,
      );

      user = new User({
        name: record.name || "Google User",
        email,
        password: hashedPassword,
        role: "USER",
        isGoogleUser: true,
      });

      await user.save();
    }

    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = generateToken(payload);

    delete otpStore[email];

    return res.json({
      success: true,
      message: "OTP verified & user logged in",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Account already exists" });
    }
    const newAdmin = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "USER",
    });
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: "Signup successful",
      adminId: newAdmin._id,
    });
  } catch (err) {
    console.error("Error in signup:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
});
// user Sign In
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email, role: "USER" });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "Given email is not valid",
      });
    }

    if (!userData.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Please contact admin.",
      });
    }

    if (!(await userData.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Password is not valid",
      });
    }

    const payload = {
      id: userData.id,
      role: "USER",
    };
    const token = generateToken(payload);
    const name = userData.name;
    const userId = userData._id;
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      name,
      userId,
    });
  } catch (err) {
    console.log("An error occured while admin login =", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const generateCRUDRoutes = (path, Model) => {
  router.get(`/get-${path}`, async (req, res) => {
    try {
      const items = await Model.find({ isActive: true }).sort({
        createdAt: -1,
      });
      res.json(items);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });
  router.get(`/get-single-${path}/:id`, async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Model.findById(id);

      if (!item) {
        return res.status(404).json({ error: `${path} not found` });
      }

      res.status(200).json(item);
    } catch (error) {
      console.error("GET single error:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });
};

generateCRUDRoutes("movie", Movie);
generateCRUDRoutes("banner", Banner);
generateCRUDRoutes("language", Language);
generateCRUDRoutes("review", Review);
generateCRUDRoutes("category", Category);
generateCRUDRoutes("theater", Theater);
generateCRUDRoutes("show", Show);
generateCRUDRoutes("booking", Booking);

//Get profile details
router.get("/get-user-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Update user profile
router.put("/update-user-profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET all movies with rating & vote count
router.get("/getMoviesWithRatings", async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "desc" } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;

    const movies = await Movie.aggregate([
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "movieId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          totalVotes: { $size: "$reviews" },
          averageRating: {
            $ifNull: [{ $avg: "$reviews.rating" }, 0],
          },
        },
      },
      {
        $project: {
          reviews: 0,
        },
      },
      {
        $sort: {
          [sortBy]: sortOrder,
        },
      },
    ]);

    res.json(movies);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

//Get location wise theaters
router.get("/get-moviewise-theater/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, city } = req.query;

    const selectedDate = new Date(date);

    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));

    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const query = {
      movie: id,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    };

    if (city) {
      query.location = city;
    }

    const data = await LocationWiseMovie.find(query).populate("theater");

    const formatted = data.map((item) => ({
      _id: item._id,
      theater: item.theater,
      language: item.language,
      theaterName: item.theater?.theater_name,
      theaterId: item.theater?._id,
      hallName: item.hall_name || null,
      shows: item.shows.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Get theater layout
router.get("/get-theater-layout/:theaterId", async (req, res) => {
  try {
    const { theaterId } = req.params;
    const theater = await Theater.findById(theaterId);
    res.json(theater);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/get-banner/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const banners = await Banner.find({ type }).sort({
      createdAt: -1,
    });

    const filteredBanners = banners.map((banner) => ({
      _id: banner._id,
      page_name: banner.page_name,
      type: banner.type,
      page_banner_image: banner.page_banner_image.filter(
        (img) => img.isActive === true,
      ),
    }));

    res.json({ data: filteredBanners });
  } catch (err) {
    console.error("Error fetching banners:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//Get Recommended Movies
router.get("/get-recommended-movies", async (req, res) => {
  try {
    const recommendedmovies = await Movie.find({
      isRecommended: true,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ data: recommendedmovies });
  } catch (err) {
    console.error("Error fetching ordered orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-recommended-shows", async (req, res) => {
  try {
    const shows = await Show.find({
      isRecommended: true,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ data: shows });
  } catch (err) {
    console.error("Error fetching shows:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Get Recommended movies by location wise
router.get("/get-recommended-movies-by-location", async (req, res) => {
  try {
    const { city } = req.query;
    const today = new Date();
    if (!city || city === "Detecting...") {
      const allMovies = await Movie.find({
        isRecommended: true,
        isActive: true,
      });
      return res.json({ data: allMovies });
    }

    const locationMovies = await LocationWiseMovie.find({
      location: { $regex: new RegExp(`^${city}$`, "i") },
      endDate: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "movie",
        match: { isRecommended: true, isActive: true },
      });

    if (!locationMovies || locationMovies.length === 0) {
      return res.status(404).json({ message: `No movies showing in ${city}` });
    }

    const movies = locationMovies
      .map((lm) => lm.movie)
      .filter((m) => m !== null);

    if (movies.length === 0) {
      return res.status(404).json({ message: `No movies showing in ${city}` });
    }

    const uniqueMoviesMap = new Map();
    movies.forEach((movie) => {
      uniqueMoviesMap.set(movie._id.toString(), movie);
    });

    const uniqueMovies = Array.from(uniqueMoviesMap.values());

    return res.json({ data: uniqueMovies });
  } catch (err) {
    console.error("Error fetching movies:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

//Gallery
router.get("/get-gallery", async (req, res) => {
  try {
    const getgallery = await Gallery.find({ isActive: true });
    res.json(getgallery);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Person want to contact
router.post("/submit-contact", async (req, res) => {
  try {
    const { name, email, message, status } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({ name, email, message, status });
    await newContact.save();

    let responseMessage = "";

    if (status === "Feedback") {
      responseMessage =
        "Thank you for your feedback. We appreciate your input and will use it to improve our services.";
    } else if (status === "Contact") {
      responseMessage =
        "Message sent successfully to us. We will contact you soon.";
    } else {
      responseMessage = "Your message has been received.";
    }

    res.status(200).json({ success: true, message: responseMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/get-typewise-category/:type", async (req, res) => {
  const { type } = req.params;

  const items = await Category.find({ isActive: true, type: type });

  res.json(items);
});

//Get Categorized Shows

router.get("/get-categorized-show/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const shows = await Show.find({ category: categoryId })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(shows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET CATEGORY BY ID
router.get("/get-maincategory/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add Review
router.post("/add-review", jwtAuthMiddleware, async (req, res) => {
  try {
    const { movieId, rating, reviewText, showId, type } = req.body;
    const userId = req.user.id;

    const review = new Review({
      movieId,
      showId,
      userId,
      rating,
      reviewText,
      type,
    });

    // console.log(review);
    await review.save();

    res.json({ success: true, message: "Review added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// Get Reviews By Movie
router.get("/reviews/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    const filter =
      type === "Movie"
        ? { movieId: id, type: "Movie" }
        : { showId: id, type: "Show" };

    const reviews = await Review.find(filter)
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/rating-summary/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    const matchStage =
      type === "Movie"
        ? { movieId: new mongoose.Types.ObjectId(id), type: "Movie" }
        : { showId: new mongoose.Types.ObjectId(id), type: "Show" };

    const result = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalVotes: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({
        averageRating: 0,
        totalVotes: 0,
      });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to get rating summary" });
  }
});

router.post("/create-order", jwtAuthMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log("RAZORPAY ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.get("/get-booked-seats", async (req, res) => {
  const { movieId, theaterId, showDate, showTime } = req.query;

  const dateStr = new Date(showDate).toISOString().split("T")[0];
  await SeatLock.updateMany(
    { expiresAt: { $lt: new Date() }, lockStatus: "Active" },
    { $set: { lockStatus: "InActive" } },
  );

  const bookings = await Booking.find({
    movieId,
    theaterId,
    showTime,
    paymentStatus: "Success",
    bookingStatus: { $in: ["Confirmed", "Partially Cancelled"] },
    $expr: {
      $eq: [
        {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$showDate",
            timezone: "Asia/Kolkata",
          },
        },
        dateStr,
      ],
    },
  });

  const lockedSeats = await SeatLock.find({
    movieId,
    theaterId,
    showTime,
    lockStatus: "Active",
    expiresAt: { $gt: new Date() },
    $expr: {
      $eq: [
        {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$showDate",
            timezone: "Asia/Kolkata",
          },
        },
        dateStr,
      ],
    },
  });

  const bookedSeats = bookings.flatMap((b) =>
    b.seats.filter((s) => s.status === "Booked").map((s) => s.seatId),
  );
  const lockedSeatIds = lockedSeats.flatMap((l) =>
    l.seats.map((s) => s.seatId),
  );
  res.json({
    bookedSeats,
    lockedSeats: lockedSeatIds,
  });
});

router.post("/lock-seats", async (req, res) => {
  try {
    const { movieId, theaterId, showDate, showTime, seats, userId } = req.body;

    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    const normalizedDate = new Date(showDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const existingLocks = await SeatLock.find({
      movieId,
      theaterId,
      showTime,
      lockStatus: "Active",
      expiresAt: { $gt: new Date() },
      "seats.seatId": { $in: seats },
    });

    if (existingLocks.length > 0) {
      return res.status(400).json({
        message: "Some seats already locked",
      });
    }

    const newLock = new SeatLock({
      movieId,
      theaterId,
      showDate: normalizedDate,
      showTime,
      seats: seats.map((s) => ({ seatId: s })),
      lockedBy: userId,
      expiresAt,
      lockStatus: "Active",
    });

    await newLock.save();

    res.json({
      success: true,
      expiresAt,
      lockId: newLock._id,
      lockStatus: "Active",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/release-lock", async (req, res) => {
  try {
    let lockId;

    if (typeof req.body === "string") {
      const parsed = JSON.parse(req.body);
      lockId = parsed.lockId;
    } else {
      lockId = req.body.lockId;
    }

    if (!lockId) return res.json({ success: true });

    const updatedSeatlock = await SeatLock.findByIdAndUpdate(
      lockId,
      { lockStatus: "InActive" },
      { new: true },
    );
    res.json({ success: true, data: updatedSeatlock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get(`/get-single-lockedseat/:lockId`, async (req, res) => {
  try {
    const { lockId } = req.params;
    const item = await SeatLock.findById(lockId);

    if (!item) {
      return res.status(404).json({ error: `${path} not found` });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("GET single error:", error);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

router.post("/confirm-booking", jwtAuthMiddleware, async (req, res) => {
  try {
    const { lockId } = req.body;

    const lock = await SeatLock.findById(lockId);

    if (!lock) {
      return res.status(400).json({
        message: "Seat lock not found. Please reselect seats.",
      });
    }

    if (lock.expiresAt < new Date()) {
      await SeatLock.updateOne(
        { _id: lockId },
        { $set: { lockStatus: "InActive" } },
      );

      return res.status(400).json({
        message: "Payment Session expired. Please reselect seats.",
      });
    }

    const booking = new Booking({
      ...req.body,
      seats: req.body.seats,
      paymentStatus: "Success",
      bookingStatus: "Confirmed",
    });
    // console.log(booking);
    await booking.save();

    await SeatLock.updateOne(
      { _id: lockId },
      {
        $set: {
          lockStatus: "InActive",
          usedForBooking: true,
        },
      },
    );
    const user = await User.findById(req.user.id);
    const theater = await Theater.findById(booking.theaterId);
    const movie = await Movie.findById(booking.movieId);

    if (!user || !theater || !movie) {
      return res.status(404).json({ message: "Data not found" });
    }
    const type = "Movie";

    setImmediate(() => {
      sendBookingEmail(booking, user, theater, movie, type);
    });

    res.json({
      message: "Booking saved successfully",
      booking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

//Full Booking Cancel
router.post("/cancel-booking", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let remainingRefund = 0;
    let refundedSeats = [];
    let refundedFood = [];

    booking.seats = booking.seats.map((seat) => {
      if (seat.status === "Booked") {
        remainingRefund += seat.price;

        refundedSeats.push({
          seatId: seat.seatId,
          category: seat.category,
          price: seat.price,
        });

        return { ...seat.toObject(), status: "Cancelled" };
      }
      return seat;
    });

    if (booking.foodItems && booking.foodItems.length > 0) {
      booking.foodItems = booking.foodItems.map((food) => {
        if (food.foodStatus === "Booked") {
          remainingRefund += food.price * food.quantity;

          refundedFood.push({
            name: food.name,
            quantity: food.quantity,
            price: food.price,
          });

          return { ...food.toObject(), foodStatus: "Cancelled" };
        }
        return food;
      });
    }

    booking.bookingStatus = "Cancelled";

    booking.refundAmount = (booking.refundAmount || 0) + remainingRefund;

    booking.refundStatus = "Fully Refunded";

    await booking.save();

    let refundDoc = null;

    if (remainingRefund > 0) {
      refundDoc = await RefundPayment.create({
        userId: booking.userId,
        bookingId: booking._id,
        movieId: booking.movieId,
        paymentId: booking.paymentId,
        seats: refundedSeats,
        refundAmount: remainingRefund,
        refundType: "Full",
      });

      try {
        await razorpay.payments.refund(booking.paymentId, {
          amount: remainingRefund * 100,
        });

        refundDoc.refundStatus = "Completed";
      } catch (err) {
        refundDoc.refundStatus = "Failed";
        console.error("Refund error:", err);
      }

      await refundDoc.save();
    }

    const user = await User.findById(booking.userId);
    const theater = await Theater.findById(booking.theaterId);

    setImmediate(() => {
      sendCancelEmail({
        user,
        booking,
        theater,
        refundAmount: remainingRefund,
        cancelType: "Full",
      });
    });

    res.json({
      message: "Full booking cancelled",
      refundAmount: remainingRefund,
      totalRefund: booking.refundAmount,
      refundStatus: booking.refundStatus,
    });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({
      message: "Error cancelling booking",
      error: err.message,
    });
  }
});

// Partial Seat Cancel
router.post("/cancel-seats", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookingId, seatIds } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let currentRefund = 0;
    let refundedSeats = [];

    booking.seats = booking.seats.map((seat) => {
      if (seatIds.includes(seat.seatId) && seat.status !== "Cancelled") {
        currentRefund += seat.price;
        refundedSeats.push({
          seatId: seat.seatId,
          category: seat.category,
          price: seat.price,
        });

        return { ...seat.toObject(), status: "Cancelled" };
      }
      return seat;
    });

    if (currentRefund === 0) {
      return res.status(400).json({ message: "No valid seats to cancel" });
    }

    const activeSeats = booking.seats.filter((s) => s.status === "Booked");

    booking.bookingStatus =
      activeSeats.length === 0 ? "Cancelled" : "Partially Cancelled";

    booking.refundAmount = (booking.refundAmount || 0) + currentRefund;

    booking.refundStatus =
      activeSeats.length === 0 ? "Fully Refunded" : "Partially Refunded";

    await booking.save();

    const refundDoc = await RefundPayment.create({
      userId: booking.userId,
      bookingId: booking._id,
      movieId: booking.movieId,
      paymentId: booking.paymentId,
      seats: refundedSeats,
      refundAmount: currentRefund,
      refundType: "Partial",
    });

    try {
      await razorpay.payments.refund(booking.paymentId, {
        amount: currentRefund * 100,
      });
      refundDoc.refundStatus = "Completed";
    } catch (err) {
      refundDoc.refundStatus = "Failed";
      console.error("Refund error:", err);
    }

    await refundDoc.save();

    const user = await User.findById(booking.userId);
    const theater = await Theater.findById(booking.theaterId);

    await sendCancelEmail({
      user,
      booking,
      theater,
      refundAmount: currentRefund,
      cancelType: "Partial",
      seatIds,
    });

    res.json({
      message: "Seats cancelled",
      refundAmount: currentRefund,
      totalRefund: booking.refundAmount,
      refundStatus: booking.refundStatus,
    });
  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({
      message: "Error cancelling booking",
      error: err.message,
    });
  }
});

//Food Cancel
router.post("/cancel-food", jwtAuthMiddleware, async (req, res) => {
  try {
    const { bookingId, foodIds } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    let refundAmount = 0;
    let refundedFoods = [];

    booking.foodItems = booking.foodItems.map((food) => {
      const cancelQty = foodIds?.[food.foodId];

      if (
        cancelQty &&
        (food.foodStatus === "Booked" ||
          food.foodStatus === "Partially Cancelled")
      ) {
        const validCancelQty = Math.min(
          cancelQty,
          food.quantity - (food.cancelledQty || 0),
        );

        if (validCancelQty <= 0) return food;

        const cancelAmount = validCancelQty * food.price;
        refundAmount += cancelAmount;

        refundedFoods.push({
          foodId: food.foodId,
          name: food.name,
          cancelledQty: validCancelQty,
          price: food.price,
          total: cancelAmount,
        });

        const newCancelledQty = (food.cancelledQty || 0) + validCancelQty;
        const remainingQty = food.quantity - newCancelledQty;

        return {
          ...food.toObject(),

          quantity: food.quantity,
          total: food.total,

          cancelledQty: newCancelledQty,
          remainingQty: remainingQty,
          cancelledTotal: (food.cancelledTotal || 0) + cancelAmount,

          foodStatus: remainingQty === 0 ? "Cancelled" : "Partially Cancelled",
        };
      }

      return food;
    });

    if (refundAmount === 0) {
      return res.status(400).json({ message: "No valid food selected" });
    }

    booking.refundAmount += refundAmount;
    booking.foodRefundAmount = (booking.foodRefundAmount || 0) + refundAmount;

    booking.refundStatus =
      booking.refundAmount >= booking.totalAmount
        ? "Fully Refunded"
        : "Partially Refunded";

    await booking.save();

    await RefundPayment.create({
      userId: booking.userId,
      bookingId: booking._id,
      movieId: booking.movieId,
      paymentId: booking.paymentId,
      foodItems: refundedFoods,
      refundAmount,
      refundType: "Food",
    });

    const user = await User.findById(booking.userId);
    const theater = await Theater.findById(booking.theaterId);

    setImmediate(() => {
      sendCancelEmail({
        user,
        booking,
        theater,
        refundAmount,
        cancelType: "Food",
        foodItems: refundedFoods,
      });
    });

    res.json({
      message: "Food partially cancelled & refund processed",
      refundAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/my-bookings", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({
      userId,
      bookingStatus: { $in: ["Confirmed", "Partially Cancelled", "Cancelled"] },
    }).sort({ createdAt: -1 });

    const result = [];

    for (let booking of bookings) {
      let itemDetails = null;
      let theaterDetails = null;
      let showDetails = null;

      if (booking.type === "Movie") {
        itemDetails = await Movie.findById(booking.movieId);

        if (booking.theaterId) {
          theaterDetails = await Theater.findById(booking.theaterId);
        }
      }

      if (booking.type === "Show") {
        if (booking.details?.showId) {
          showDetails = await Show.findById(booking.details.showId);
        }
      }

      result.push({
        ...booking._doc,
        movie: itemDetails,
        theater: theaterDetails,
        show: showDetails,
      });
    }

    res.json({
      bookings: result,
    });
  } catch (error) {
    console.log("BOOKING FETCH ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

//Ticket Verification API
router.post("/verify-ticket", async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.json({ valid: false });
    }

    const activeSeats = booking.seats.filter(
      (seat) => seat.status === "Booked",
    );

    if (activeSeats.length === 0) {
      return res.json({ valid: false, message: "All seats cancelled" });
    }

    res.json({
      valid: true,
      movie: booking.movieTitle,
      seats: activeSeats,
      showTime: booking.showTime,
      showDate: booking.showDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/confirm-show-booking", jwtAuthMiddleware, async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      paymentStatus: "Success",
      bookingStatus: "Confirmed",
    });
    // console.log(booking);
    await booking.save();
    const user = await User.findById(req.user.id);

    const details = booking.details;

    const fakeTheater = {
      theater_name: details.theaterName,
      location_name: details.locationName,
    };

    const fakeMovie = {
      movieimage: "https://via.placeholder.com/300x450",
    };

    const normalizedBooking = {
      ...booking.toObject(),
      movieTitle: details.showTitle,
      showDate: details.date,
      showTime: details.startTime,
      ticketPrice: details.ticketPrice,
      seatCount: details.seatCount,
    };

    const type = "Show";

    setImmediate(() => {
      sendBookingEmail(normalizedBooking, user, fakeTheater, fakeMovie, type);
    });

    res.json({
      message: "Booking saved successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/similar-shows/:id", async (req, res) => {
  try {
    const currentShow = await Show.findById(req.params.id);

    if (!currentShow) {
      return res.status(404).json({ message: "Show not found" });
    }

    const similarShows = await Show.find({
      _id: { $ne: currentShow._id },
      subCategory: { $in: currentShow.subCategory },
      isActive: true,
    })
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(similarShows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching similar shows" });
  }
});

router.get("/similar-movies/:id", async (req, res) => {
  try {
    const currentMovie = await Movie.findById(req.params.id);

    if (!currentMovie) {
      return res.status(404).json({ message: "Show not found" });
    }

    const similarMovies = await Movie.find({
      _id: { $ne: currentMovie  ._id },
      category: { $in: currentMovie.category },
      isActive: true,
    })
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(similarMovies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching similar movies" });
  }
});

module.exports = router;
