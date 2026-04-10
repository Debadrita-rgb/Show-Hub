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
// const MovieBooking = require("../models/MovieBooking");
const Gallery = require("../models/Gallery");
const Contact = require("../models/Contact");
const Notification = require("../models/Notification");
const Testimonial = require("../models/Testimonial");
const Review = require("../models/Review");
const Banner = require("../models/Banner");
const Language = require("../models/Language");
const Category = require("../models/Category");
const LocationWiseMovie = require("../models/LocationWIseMovieSelection");
const Theater = require("../models/Theater");
const Show = require("../models/Show");
const razorpay = require("../api/razorpay");
const formatDate = require("../utils/dateHelper");

const fs = require("fs");
const generateInvoice = require("../utils/invoiceService");

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
    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_USER,
        name: "ShowHub",
      },
      subject:
        "Showhub Login: Here's the 6-digit verification code you requested",
      html: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">

  <div style="text-align:center;">
      <img src="https://show-hub-frontend.onrender.com/assets/admin_login_logo-CDHIE2pX.png" width="80" />
    </div>
      <div style="border: 1px solid #eee; padding: 20px; border-radius: 8px; background: #fafafa;">
      <p>Hello <b>${name || "User"}</b>,</p>
    <p style="margin-bottom: 10px;">Your one-time verification code:</p>
    <div style="font-size: 36px; font-weight: bold;">${otp}</div>
  </div>

        <p style="font-size: 14px; color: #777;">
          This code will expire in <b>5 minutes</b>.
        </p>

        <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
          If you didn’t request this, you can safely ignore this email.
        </p>

      </div>

      <p style="text-align:center; font-size:12px; color:#aaa; margin-top:20px;">
        © ${new Date().getFullYear()} ShowHub. All rights reserved.
      </p>

    </div>
    `,
    };

    await sgMail.send(msg);

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

    //   Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(
        record.password || "google_user",
        10,
      );

      //   Create user
      user = new User({
        name: record.name || "Google User",
        email,
        password: hashedPassword,
        role: "USER",
      });

      await user.save();
    }

    //   Generate JWT
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
      password, // Auto-hashed by the User model
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

router.get("/notifications", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/notifications/mark-read", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } },
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// const getModelByPath = (path) => {
//   return serviceModels[path] || null;
// };

// router.get(`/movieIdcategorized-:path`, async (req, res) => {
//   try {
//     const { path } = req.params;
//     const { category } = req.query;
//     const Model = getModelByPath(path);

//     if (!Model) {
//       return res.status(400).json({ error: "Invalid service path." });
//     }

//     const query = {};
//     // const query = { isActive: true };

//     if (category) query.category = category;
//     query.isActive = true;

//     const items = await Model.find(query);
//     res.json(items);
//   } catch (error) {
//     console.error("Server Error:", error);
//     res.status(500).json({ error: "Failed to fetch items" });
//   }
// });

// //get user details by id
// router.get("/movieIduser-details/:id", jwtAuthMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("name email").lean();
//     if (!user) return res.status(404).json({ error: "User not found" });
//     res.json({
//       name: user.name,
//       email: user.email,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

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
generateCRUDRoutes("testimonial", Testimonial);
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

    // Start of selected day
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));

    // End of selected day
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // console.log("startOfDay", startOfDay);
    // console.log("endOfDay", endOfDay);

    const query = {
      movie: id,
      startDate: { $lte: endOfDay },
      endDate: { $gte: startOfDay },
    };

    if (city) {
      query.location = city;
    }

    const data = await LocationWiseMovie.find(query).populate("theater");

    // const data = await LocationWiseMovie.find({
    //   movie: id,
    //   location: city,
    //   startDate: { $lte: endOfDay },
    //   endDate: { $gte: startOfDay },
    // }).populate("theater");

    // console.log("data", data);

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
    // console.log(formatted)
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
      .limit(5); // ✅ only 5 shows

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
      // No city provided, return all recommended movies
      const allMovies = await Movie.find({
        isRecommended: true,
        isActive: true,
      });
      return res.json({ data: allMovies });
    }

    // Check if city exists in LocationWiseMovie
    const locationMovies = await LocationWiseMovie.find({
      location: { $regex: new RegExp(`^${city}$`, "i") },
      endDate: { $gte: today },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "movie",
        match: { isRecommended: true, isActive: true },
      });
    // console.log("locationMovies", locationMovies);

    if (!locationMovies || locationMovies.length === 0) {
      // City doesn't exist in location collection
      return res.status(404).json({ message: `No movies showing in ${city}` });
    }

    // Extract movies that exist
    const movies = locationMovies
      .map((lm) => lm.movie)
      .filter((m) => m !== null);

    if (movies.length === 0) {
      // City exists but no recommended/active movies
      return res.status(404).json({ message: `No movies showing in ${city}` });
    }

    const uniqueMoviesMap = new Map();
    movies.forEach((movie) => {
      uniqueMoviesMap.set(movie._id.toString(), movie);
    });

    const uniqueMovies = Array.from(uniqueMoviesMap.values());

    return res.json({ data: uniqueMovies });
    // return res.json({ data: movies });
  } catch (err) {
    console.error("Error fetching movies:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my-bookings", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });

    const result = [];

    for (let booking of bookings) {
      let itemDetails = null;
      let theaterDetails = null;
      let showDetails = null;

      // MOVIE BOOKING
      if (booking.type === "Movie") {
        itemDetails = await Movie.findById(booking.movieId);

        if (booking.theaterId) {
          theaterDetails = await Theater.findById(booking.theaterId);
        }
      }

      // SHOW BOOKING
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

    res.json({
      valid: true,
      movie: booking.movieTitle,
      seats: booking.seats,
      showTime: booking.showTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

//Person want to testimonial
router.post("/submit-testimonial", async (req, res) => {
  try {
    const { name, designation, message, profileimage } = req.body;
    if (!name || !designation || !message || !profileimage) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newTestimonial = new Testimonial({
      name,
      designation,
      message,
      profileimage,
    });
    await newTestimonial.save();

    res.status(200).json({
      success: true,
      message:
        "Testimonial saved successfully but after admin approval it is showing",
    });
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

    const shows = await Show.find({ category: categoryId }).populate(
      "category",
      "name",
    );

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
    console.log("BODY:", req.body);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: amount * 100,
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

  router.post("/save-booking", jwtAuthMiddleware, async (req, res) => {
    try {
      console.log(req.body);
      const booking = new Booking(req.body);
      console.log("booking", booking);
      // await booking.save();

  const user = await User.findById(req.user.id);
  const theater = await Theater.findById(booking.theaterId);
  const movie = await Movie.findById(booking.movieId);

  if (!user) return res.status(404).json({ message: "User not found" });
  if (!theater) return res.status(404).json({ message: "Theater not found" });
  if (!movie) return res.status(404).json({ message: "Movie not found" });

  const theaterName = theater.theater_name;
  const location = theater.location_name;
  const movieImage = movie?.movieimage || "";

  if (!booking.showDate) {
    throw new Error("showDate missing");
  }
      const email = user.email;
      const name = user.name;
      const formattedSeats = booking.seats
        ?.map((seat) => `${seat.seatId} (${seat.category})`)
        .join(", ");
      const formattedDate = formatDate(booking.showDate);
      const formattedTime = new Date(booking.showDate).toLocaleTimeString(
        "en-IN",
        { hour: "numeric", minute: "2-digit", hour12: true },
      );

const seatsHTML = booking.seats
  ?.map(
    (seat) => `
    <div style="display:flex; justify-content:space-between; font-size:13px; margin:2px 0;">
      <span>${seat.seatId} (${seat.category})</span>
      <span>₹${seat.price}</span>
    </div>
  `,
  )
  .join("");

const foodHTML =
  booking.foodItems && booking.foodItems.length > 0
    ? `
<div style="margin-top:20px; background:#fafafa; padding:10px; border-radius:6px;">
      <h4 style="margin-bottom:10px;">🍿 Food & Beverages</h4>

      ${booking.foodItems
        .map(
          (item) => `
          <div style="
            display:flex; 
            justify-content:space-between; 
            font-size:13px; 
            margin-bottom:8px;
          ">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.total}</span>
          </div>
        `,
        )
        .join("")}

      <!-- Divider -->
      <div style="border-top:1px dashed #ccc; margin:10px 0;"></div>

      <!-- Food Total -->
      <div style="
        display:flex; 
        justify-content:space-between; 
        font-weight:bold;
      ">
        <span>Food Total</span>
        <span>₹${foodTotal}</span>
      </div>
    </div>
  `
    : "";

    const foodTotal =
      booking.foodItems?.reduce((sum, item) => sum + item.total, 0) || 0;

      const msg = {
        to: email,
        from: {
          email: process.env.EMAIL_USER,
          name: "ShowHub",
        },
        subject: "🎬 Booking Confirmed - ShowHub",
        html: `
<div style="font-family: Arial, sans-serif; background:#f2f2f2; padding:20px;">
  <div style="max-width:700px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden;">

    <!-- HEADER -->
    <div style="
  background: linear-gradient(135deg, #000000, #4c1d95, #000000);
  color:white;
  padding:20px;
">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <img src="https://show-hub-frontend.onrender.com/assets/logo-CWqOHdnZ.png" width="80"/>
    <span style="font-size:12px;">BOOKING ID: ${booking.bookingId || booking._id}</span>
  </div>

  <h2 style="margin-top:15px;">M-Ticket</h2>
  <h3 style="margin:5px 0;">Hey ${name}, your booking is confirmed! 🎉</h3>

      <p style="font-size:13px;">View tickets in your profile on the app / mobile web.</p>
    </div>

    <!-- MOVIE CARD -->
    <div style="padding:20px; border-bottom:1px dashed #ccc;">

      <div style="display:flex; gap:15px;">
        
        <!-- MOVIE IMAGE -->
        <img 
          src="${movieImage || "https://via.placeholder.com/120x160"}" 
          style="width:120px; height:160px; object-fit:cover; border-radius:6px;"
        />

        <!-- DETAILS -->
        <div style="flex:1; margin-left:3px">
          <h3 style="margin:0;">${booking.movieTitle}</h3>

          <p style="margin:5px 0; color:#666;">
            ${theaterName}<br/>
            ${location}
          </p>

          <p style="margin:5px 0;">
            <strong>Date & Time:</strong><br/>
            ${formattedDate} | ${formattedTime}
          </p>

          <p style="margin:5px 0;">
            <strong>Hall:</strong> ${booking.hallName || ""}
          </p>
        </div>
      </div>

      <!-- SEATS LIST -->
      <div style="margin-top:15px;">
        <h4 style="margin-bottom:5px;">💺 Seats</h4>
        ${seatsHTML}
      </div>

      ${foodHTML}

      <!-- SUMMARY -->
      <div style="display:flex; justify-content:space-between; margin-top:15px;">
        <div>
          <p style="margin:0; font-size:12px; color:#777;">Total Tickets</p>
          <strong>${booking.seats?.length || 1}</strong>
        </div>

        <div>
          <p style="margin:0; font-size:12px; color:#777;">Ticket Price</p>
          <strong>₹${booking.ticketPrice}</strong>
        </div>
      </div>

    </div>

    <!-- BUTTON -->
    <div style="padding:20px; text-align:center;">
      <a 
        href="https://show-hub-frontend.onrender.com/verify-booking/${booking.bookingId || booking._id}"
        style="display:inline-block; padding:12px 25px; background:#e74c3c; color:white; text-decoration:none; border-radius:6px; font-weight:bold;"
      >
        View Tickets
      </a>
    </div>

    <!-- PAYMENT DETAILS -->
    <div style="padding:20px; border-top:1px solid #eee;">
      <h3>Total amount paid <span style="float:right;">₹${booking.totalAmount}</span></h3>

      <p style="color:#777;">Ticket price <span style="float:right;">₹${booking.ticketPrice}</span></p>

      ${
        booking.foodItems && booking.foodItems.length > 0
          ? `<p style="color:#777;">
         Food Total 
         <span style="float:right;">₹${foodTotal}</span>
       </p>`
          : ""
      }

      <p style="color:#777;">Convenience Fee <span style="float:right;">₹${booking.convenienceFee}</span></p>
      <p style="color:#777;">Paid using <span style="float:right;">Online</span></p>
    </div>

    <!-- INFO -->
    <div style="margin:20px; padding:15px; background:#fff3cd; border-left:4px solid #f1c40f; border-radius:5px;">
      <strong>Contactless & Fast-track Entry with M-ticket</strong>
      <p style="margin:5px 0;">
        Safe and contactless entry through M-Ticket scanning! No more box office queue!
      </p>
    </div>

    <!-- HOW TO USE -->
    <div style="padding:20px;">
      <h4>How to use M-Ticket:</h4>
      <ol style="color:#555;">
        <li>Log in to ShowHub from app or mobile browser.</li>
        <li>Go to "Your Orders".</li>
        <li>Show QR code at entry.</li>
      </ol>
    </div>

    <!-- FOOTER -->
    <div style="padding:20px; text-align:center; border-top:1px solid #eee;">
      <a href="https://show-hub-frontend.onrender.com/contact" style="color:#e74c3c; border:1px solid #e74c3c; padding:10px 15px; border-radius:5px; text-decoration:none;">
        Need help? Contact Support
      </a>
    </div>

  </div>
</div>
`,
      };

      const pdfBuffer = await generateInvoice(booking, user);

      msg.attachments = [
        {
          content: pdfBuffer.toString("base64"),
          filename: "invoice.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ];
      sgMail
        .send(msg)
        .then(() => console.log("Email sent"))
        .catch((err) => console.log("Email error:", err));

      res.json({
        message: "Booking saved successfully",
        booking,
      });
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("STACK:", error.stack);
      console.error("SendGrid error:", error.response?.body || error.message,);

      res.status(500).json({ message: error.message });
    }
  });

router.get("/get-booked-seats", async (req, res) => {
  try {
    const { movieId, theaterId, showDate, showTime } = req.query;

    const dateOnly = new Date(showDate).toISOString().split("T")[0];

    const bookings = await Booking.find({
      movieId,
      theaterId,
      showTime,
      paymentStatus: "Success",
      $expr: {
        $eq: [
          { $dateToString: { format: "%Y-%m-%d", date: "$showDate" } },
          dateOnly,
        ],
      },
    });

    // console.log("bookings:", bookings);

    const bookedSeats = bookings.flatMap((b) => b.seats);
    res.json(bookedSeats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/create-show-order", jwtAuthMiddleware, async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required",
      });
    }

    const options = {
      amount: amount * 100,
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

router.post("/save-show-booking", jwtAuthMiddleware, async (req, res) => {
  try {
    // console.log(req.body);
    const booking = new Booking(req.body);

    await booking.save();

    res.json({
      message: "Booking saved successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
