const jwt = require('jsonwebtoken');
require("dotenv").config();

// Use the correct secret key
const JWT_SECRET = process.env.JWT_SECRET || "qwertyuiuytrewq";

const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: "1d" });  // Use JWT_SECRET
}
const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) return res.status(401).json({ error: "No Token Found" });

  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid Token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // req.jwtPayload = decoded;
    // console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err);
    return res.status(403).json({ error: "Authorization Denied" });
  }
};

module.exports = { generateToken, jwtAuthMiddleware };
