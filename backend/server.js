const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://show-hub-frontend.onrender.com",
    ],
    credentials: true,
  }),
);

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

app.use(express.json());

const PORT = process.env.PORT || 5000;


// Routes
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require("./routes/userRoutes");
const commonRoutes = require("./routes/commonRoutes");

app.use('/admin', adminRoutes);  
app.use("/user", userRoutes);  
app.use("/common", commonRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is running on port 5000`);
})