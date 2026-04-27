const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jsonwebtoken = require("../middleware/auth")("ADMIN");
const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const axios = require("axios");
const dayjs = require("dayjs");

const User = require("../models/User");
const Category = require("../models/Category");
const Movie = require("../models/Movie");
const Gallery = require("../models/Gallery");
const Contact = require("../models/Contact");
const Testimonial = require("../models/Testimonial");
const Theater = require("../models/Theater");
const Banner = require("../models/Banner");
const Language = require("../models/Language");
const LocationWiseMovie = require("../models/LocationWIseMovieSelection");
const Show = require("../models/Show");
const Booking = require("../models/Booking");


const { calculateEndTime } = require("../utils/timeHelper");

// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     let existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Account already exists" });
//     }
//     const newAdmin = new User({
//       name,
//       email: email.toLowerCase(), 
//       password, // Auto-hashed by the User model
//       role: "ADMIN",
//     });
//     await newAdmin.save();

//     res.status(201).json({
//       success: true,
//       message: "Signup successful",
//       adminId: newAdmin._id,
//     });
//   } catch (err) {
//     console.error("Error in signup:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: err.message });
//   }
// });
//  "success": true,
//     "message": "Signup successful",
//     "adminId": "681a5d674de33640dbf04bf4"

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email: email });
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
      role: "ADMIN",
    };
    const token = generateToken(payload);
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
    });
  } catch (err) {
    console.log("An error occured while admin login =", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}); 

router.get("/dashboardData", jwtAuthMiddleware, async (req, res) => {
  try {
    const nUser = await User.countDocuments();
    const movieCount = await Movie.countDocuments();
    const showCount = await Show.countDocuments();
    
    res.status(200).json({
      success: true,
      nUser,
      movieCount,
      showCount,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.get("/dashboard-revenue", jwtAuthMiddleware, async (req, res) => {
  try {
    let { type, startDate, endDate, month, date } = req.query;

    const match = {
      paymentStatus: "Success",
      // type: "Movie",
    };

    let groupStage;

    if (date) {
      const d = new Date(date);
      match.createdAt = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999)),
      };

      groupStage = {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalRevenue: {
          $sum: {
            $subtract: [
              { $ifNull: ["$totalAmount", 0] },
              { $ifNull: ["$refundAmount", 0] },
            ],
          },
        },
      };
    }

    else if (type === "monthly") {
      const today = new Date();

      const selectedMonth = month ? Number(month) - 1 : today.getMonth();
      const year = today.getFullYear();

      const start = new Date(year, selectedMonth, 1);
      const end = new Date(year, selectedMonth + 1, 0, 23, 59, 59, 999);

      match.createdAt = {
        $gte: start,
        $lte: end,
      };

      groupStage = {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalRevenue: {
          $sum: {
            $subtract: [
              { $ifNull: ["$totalAmount", 0] },
              { $ifNull: ["$refundAmount", 0] },
            ],
          },
        },
      };
    }

    else if (type === "weekly") {
      const today = new Date();
      const day = today.getDay();  

      const diff = day >= 5 ? day - 5 : 7 - (5 - day);
      const friday = new Date(today);
      friday.setDate(today.getDate() - diff);
      friday.setHours(0, 0, 0, 0);

      match.createdAt = {
        $gte: friday,
        $lte: today,
      };

      groupStage = {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        totalRevenue: {
          $sum: {
            $subtract: [
              { $ifNull: ["$totalAmount", 0] },
              { $ifNull: ["$refundAmount", 0] },
            ],
          },
        },
      };
    }

    else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      match.createdAt = { $gte: start, $lte: end };

      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        groupStage = {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: {
            $sum: {
              $subtract: [
                { $ifNull: ["$totalAmount", 0] },
                { $ifNull: ["$refundAmount", 0] },
              ],
            },
          },
        };
      }

      else if (diffDays <= 31) {
        groupStage = {
          _id: {
            range: {
              $concat: [
                {
                  $toString: {
                    $subtract: [
                      { $dayOfMonth: "$createdAt" },
                      { $mod: [{ $dayOfMonth: "$createdAt" }, 7] },
                    ],
                  },
                },
                "-",
                {
                  $toString: {
                    $add: [
                      {
                        $subtract: [
                          { $dayOfMonth: "$createdAt" },
                          { $mod: [{ $dayOfMonth: "$createdAt" }, 7] },
                        ],
                      },
                      6,
                    ],
                  },
                },
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $subtract: [
                { $ifNull: ["$totalAmount", 0] },
                { $ifNull: ["$refundAmount", 0] },
              ],
            },
          },
        };
      }

      else {
        groupStage = {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalRevenue: {
            $sum: {
              $subtract: [
                { $ifNull: ["$totalAmount", 0] },
                { $ifNull: ["$refundAmount", 0] },
              ],
            },
          },
        };
      }
    }

    else {
      const today = new Date();
      match.createdAt = {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lte: new Date(today.setHours(23, 59, 59, 999)),
      };

      groupStage = {
        _id: {
          day: { $dayOfMonth: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalRevenue: {
          $sum: {
            $subtract: [
              { $ifNull: ["$totalAmount", 0] },
              { $ifNull: ["$refundAmount", 0] },
            ],
          },
        },
      };
    }

    const revenue = await Booking.aggregate([
      { $match: match },
      { $group: groupStage },
      {
        $sort:
          type === "monthly"
            ? { "_id.range": 1 }
            : { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    res.json({ success: true, revenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/dashboard-popular-movies", jwtAuthMiddleware, async (req, res) => {
    try {
      const data = await Booking.aggregate([
        { $match: { paymentStatus: "Success" } },
        {
          $group: {
            _id: "$movieId",
            totalBookings: { $sum: 1 },
          },
        },
        { $sort: { totalBookings: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "movies",
            localField: "_id",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
      ]);

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  },
);

router.get("/dashboard-busiest-theaters", jwtAuthMiddleware, async (req, res) => {
    try {
      const data = await Booking.aggregate([
        { $match: { paymentStatus: "Success", type: "Movie" } },

        {
          $group: {
            _id: {
              theaterId: "$theaterId",
              hallName: "$hallName",
            },
            seatsBooked: { $sum: { $size: "$seats" } },
          },
        },

        {
          $lookup: {
            from: "theaters",
            localField: "_id.theaterId",
            foreignField: "_id",
            as: "theater",
          },
        },

        { $unwind: "$theater" },

        {
          $project: {
            _id: 0,
            theaterId: "$_id.theaterId",
            theaterName: "$theater.theater_name",
            locationName: "$theater.location_name",

            hallName: {
              $cond: [
                { $ifNull: ["$_id.hallName", false] },
                "$_id.hallName",
                "$$REMOVE",
              ],
            },

            seatsBooked: 1,
          },
        },

        { $sort: { seatsBooked: -1 } },
        { $limit: 5 },
      ]);

      res.json({ success: true, data });
    } catch (err) {
      console.error("Busiest Theater Error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
);

router.get("/dashboard-peak-hours", jwtAuthMiddleware, async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $group: {
          _id: { $hour: "$createdAt" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { bookings: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/dashboard-cancellation-rate", jwtAuthMiddleware, async (req, res) => {
    try {
      const total = await Booking.countDocuments();
      const cancelled = await Booking.countDocuments({
        bookingStatus: "Cancelled",
      });

      const rate = (cancelled / total) * 100;

      res.json({ success: true, rate });
    } catch (err) {
      res.status(500).json({ success: false });
    }
  },
);

// Generic CRUD Route Generator
const generateCRUDRoutes = (path, Model) => {
  router.get(`/get-${path}`, jwtAuthMiddleware, async (req, res) => {
    try {
      const items = await Model.find().sort({ createdAt: -1 });
      res.json(items);
    } catch (error) {
      console.error("Server Error:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  });

  router.get(`/get-single-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Item not found" });
      res.json(item);
    } catch (error) {
      console.error("GET single error:", error);
      res.status(500).json({ error: "Failed to fetch item" });
    }
  });

  // Add
  router.post(`/add-${path}`, jwtAuthMiddleware, async (req, res) => {
    try {
      const item = new Model(req.body);
      // console.log(item);
      await item.save();
      res.json({ message: `${path} added`, item });
    } catch (error) {
      console.error("Server Error:", error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  });

  // PUT update item by ID
  router.put(`/update-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const updatedItem = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!updatedItem)
        return res.status(404).json({ error: "Item not found" });
      res.json(updatedItem);
    } catch (error) {
      console.error("PUT error:", error);
      res.status(500).json({ error: "Failed to update item" });
    }
  });

  // DELETE item by ID
  router.delete(`/delete-${path}/:id`, jwtAuthMiddleware, async (req, res) => {
    try {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem)
        return res.status(404).json({ error: "Item not found" });
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("DELETE error:", error);
      res.status(500).json({ error: "Failed to delete item" });
    }
  });

  // Toggle isActive
  router.patch(
    `/toggle-${path}-status/:id`,
    jwtAuthMiddleware,
    async (req, res) => {
      const { isActive } = req.body;
      try {
        const updated = await Model.findByIdAndUpdate(
          req.params.id,
          { isActive },
          { new: true },
        );
        res.json({ message: `${path} status updated`, updated });
      } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({ message: `Failed to toggle ${path} status` });
      }
    },
  );

  // toggle Recommended
  router.patch(
    `/toggle-${path}-recommended/:id`,
    jwtAuthMiddleware,
    async (req, res) => {
      const { isRecommended } = req.body;
      try {
        const updated = await Model.findByIdAndUpdate(
          req.params.id,
          { isRecommended },
          { new: true },
        );
        res.json({ message: `${path} status updated`, updated });
      } catch (err) {
        console.error("Toggle Error:", err);
        res.status(500).json({ message: `Failed to toggle ${path} status` });
      }
    },
  );

  router.get(
    `/get-categorized-${path}`,
    jwtAuthMiddleware,
    async (req, res) => {
      try {
        const { category } = req.query;
        let query = {};

        if (category) {
          query.category = category;
        }

        const items = await Model.find(query);
        res.json(items);
      } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to fetch items" });
      }
    },
  );

  //add user
  router.post(`/add-user`, jwtAuthMiddleware, async (req, res) => {
    try {
      const newUser = new User(req.body);
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Add user failed:", error);
      res.status(400).json({ error: error.message });
    }
  });
};

// Generate routes for all admin sections
generateCRUDRoutes("movie", Movie);
generateCRUDRoutes("user", User);
generateCRUDRoutes("gallery", Gallery);
generateCRUDRoutes("contact", Contact);
generateCRUDRoutes("category", Category);
generateCRUDRoutes("testimonial", Testimonial);
generateCRUDRoutes("theater", Theater);
generateCRUDRoutes("banner", Banner);
generateCRUDRoutes("show", Show);
generateCRUDRoutes("language", Language);

const isValidYouTubeURL = (url) => {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|shorts\/)?([a-zA-Z0-9_-]{11})/;
  return regex.test(url);
};

//add single movie
router.post(`/add-single-movie`, jwtAuthMiddleware, async(req, res) =>{
try {
  const { trailerlink, ...rest } = req.body;

  const item = new Movie({
    ...rest,
    trailerlink: trailerlink || null,
  });

  await item.save();

res.status(201).json({
  message: "Movie added successfully",
  item,
});
} catch (error) {
  console.error("Server Error:", error);
  res.status(500).json({
    error: "Internal server error",
    details: error.message,
  });
}

});

//update single movie
router.put(`/update-single-movie/:id`, jwtAuthMiddleware, async (req, res) => {
  try {
    const { trailerlink } = req.body;

    if (trailerlink && !isValidYouTubeURL(trailerlink)) {
      return res.status(400).json({
        error: "Invalid YouTube URL",
      });
    }

    const updatedItem = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

//Add show category
router.post(`/add-type-category`, jwtAuthMiddleware, async (req, res) => {
  try {
    const { name, image, type, subCategories } = req.body;

    const ShowCategorys = new Category({
      name,
      image,
      type,
      subCategories: subCategories
        ? subCategories.map((sub) => ({ title: sub.title }))
        : [],
    });
    await ShowCategorys.save();

    res.status(201).json({ message: "Category created" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//Get type wise full category
router.get("/get-typewise-category/:type", async (req, res) => {
  const { type } = req.params;

  const items = await Category.find({ isActive: true, type: type });

  res.json(items);
});

//update type wise category
router.put("/update-typewise-category/:id", jwtAuthMiddleware, async (req, res) => {
  try {
    const { name, image, type, subCategories = [] } = req.body;

    const updatedData = {
      name,
      image,
      type,
      subCategories:
        type === "Show"
          ? subCategories.map((sub) => ({ title: sub.title }))
          : [],
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true },
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post(`/add-locationwise-movie`, jwtAuthMiddleware, async (req, res) => {
  try {
    const { movie, location, theater, hall_name, startDate, endDate, shows, language } =
      req.body;

    if (!shows || shows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one show is required",
      });
    }

    const existingShows = await LocationWiseMovie.find({
      theater,
      hall_name,
    });

    for (let newShow of shows) {
      const newStart = dayjs(`1970-01-01T${newShow.startTime}`);
      let newEnd = dayjs(`1970-01-01T${newShow.endTime}`);

      if (newEnd.isBefore(newStart)) {
        newEnd = newEnd.add(1, "day");
      }

      for (let movie of existingShows) {
        for (let show of movie.shows) {
          const start = dayjs(`1970-01-01T${show.startTime}`);
          let end = dayjs(`1970-01-01T${show.endTime}`);

          if (end.isBefore(start)) {
            end = end.add(1, "day");
          }

          if (newStart.isBefore(end) && newEnd.isAfter(start)) {
            return res.status(400).json({
              success: false,
              message: `Hall already has a show between ${show.startTime} - ${show.endTime}`,
            });
          }
        }
      }
    }

    const checkOverlap = (shows) => {
      const parsed = shows.map((s) => {
        let start = dayjs(`1970-01-01T${s.startTime}`);
        let end = dayjs(`1970-01-01T${s.endTime}`);

        if (end.isBefore(start)) end = end.add(1, "day");

        return { start, end };
      });

      for (let i = 0; i < parsed.length; i++) {
        for (let j = i + 1; j < parsed.length; j++) {
          if (
            parsed[i].start.isBefore(parsed[j].end) &&
            parsed[i].end.isAfter(parsed[j].start)
          ) {
            return true;
          }
        }
      }

      return false;
    };

    if (checkOverlap(shows)) {
      return res.status(400).json({
        success: false,
        message: "Show overlaps with another show",
      });
    }

    const newMovie = new LocationWiseMovie({
      movie,
      location,
      theater,
      hall_name,
      startDate,
      endDate,
      shows,
      language,
    });
    await newMovie.save();

    res.json({
      success: true,
      message: "Shows added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// get the total location wise movie data
router.get(`/get-locationwise-movie`, jwtAuthMiddleware, async (req, res) => {
  try {
    const shows = await LocationWiseMovie.find()
      .populate("movie", "title")
      .populate("theater", "theater_name")
      .sort({ createdAt: -1 });
    res.json(shows);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//get the location wise movie data by id
router.get("/get-single-locationwise-movie/:id", async (req, res) => {
  try {
    const data = await LocationWiseMovie.findById(req.params.id)
      .populate("movie")
      .populate("theater");

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch data" });
  }
});

//update the location wise movie
router.put("/update-locationwise-movie/:id", async (req, res) => {
  try {
    const updated = await LocationWiseMovie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.get(`/get-fullcontact-details`, jwtAuthMiddleware, async (req, res) => {
  try {
    const items = await Contact.find({ status: "Contact" }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

router.get(`/get-fullfeedback-details`, jwtAuthMiddleware, async (req, res) => {
  try {
    const items = await Contact.find({ status: "Feedback" }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

//Add Show
router.post("/add-show", async (req, res) => {
  try {
    let {
      showName,
      media,
      category,
      subCategory,
      isMultipleLocation,
      locations,
      languages,
      ageLimit,
      description,
      artists,
      startDate,
      endDate,
    } = req.body;
    
     if (isMultipleLocation) {
       // Multiple location → keep dates inside locations
       startDate = null;
       endDate = null;

       locations = locations.map((loc) => ({
         ...loc,
         date: loc.date, // keep
       }));
     } else {
       // Single location → remove location date
       locations = locations.map((loc) => ({
         ...loc,
         date: null, // ❌ remove date
       }));

       // Optional validation
       if (!startDate || !endDate) {
         return res.status(400).json({
           success: false,
           message: "Start Date and End Date are required",
         });
       }
     }

    const show = new Show({
      showName,
media,
      // showImage,
      category,
      subCategory,
      isMultipleLocation,
      locations,
      languages,
      ageLimit,
      description,
      artists,
      startDate,
      endDate,
    });
    console.log(show);
    // await show.save();

    res.status(201).json({
      success: true,
      message: "Show Added Successfully",
      data: show,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating show",
      error: error.message,
    });
  }
});

// get bookinging details 
router.get("/get-booked-details", jwtAuthMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingStatus: { $in: ["Confirmed", "Partially Cancelled"] },
      paymentStatus: "Success",
    })
      .populate("userId", "name email")
      .populate("theaterId", "theater_name location_name")
      .sort({ createdAt: -1 });

    const enrichedBookings = bookings.map((booking) => ({
      ...booking.toObject(),
      MovieName: booking.movieTitle,
      theaterName: booking.theaterId?.theater_name || "Theater not found",
      locationName: booking.theaterId?.location_name || "Location not found",
    }));

    res.json(enrichedBookings);
  } catch (error) {
    console.error("Error fetching booked party halls:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports = router;

// get cancelled booking details 
(router.get(
  "/get-cancelled-booked-details",
  jwtAuthMiddleware,
  async (req, res) => {
    try {
      const bookings = await Booking.find({
        bookingStatus: "Cancelled",
      })
        .populate("userId", "name email")
        .populate("theaterId", "theater_name location_name")
        .sort({ createdAt: -1 });

      const enrichedBookings = bookings.map((booking) => ({
        ...booking.toObject(),
        MovieName: booking.movieTitle,
        theaterName: booking.theaterId?.theater_name || "Theater not found",
        locationName: booking.theaterId?.location_name || "Location not found",
      }));

      res.json(enrichedBookings);
    } catch (error) {
      console.error("Error fetching booked party halls:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
),
  router.get("/get-user-booked-details/:id", jwtAuthMiddleware, async (req, res) => {
      try {
        const userId = req.params.id;

        const bookings = await Booking.find({ userId })
          .populate("movieId")
          .populate("theaterId")
          .populate("userId")
          .sort({ createdAt: -1 });

        if (!bookings.length) {
          return res.status(404).json({ message: "No bookings found" });
        }

        res.status(200).json(bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Server error" });
      }
    },
  ));

module.exports = router;
