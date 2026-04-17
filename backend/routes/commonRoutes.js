const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jsonwebtoken = require("../middleware/auth")("ADMIN");
const { generateToken, jwtAuthMiddleware } = require("../middleware/jwt");
const User = require("../models/User");

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
      role: userData.role,
    };
    const token = generateToken(payload);
    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      role: userData.role,
    });
  } catch (err) {
    console.log("An error occured while admin login =", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});
module.exports = router;