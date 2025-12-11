require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");


// Correct route imports
const authRoutes = require("./routes/authRoutes");       // ✅ match file name
const adminRoutes = require("./routes/admin");           // ✅ match file name
const patientRoutes = require("./routes/patientRoutes"); // ✅ match file name
const feedbackRoutes = require("./routes/feedbackRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const publicRoutes = require('./routes/publicRoutes');
const adminCallbacksRouter = require('./routes/adminCallbacks');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.url);
  next();
});
// API routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/doctor", doctorRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin/callbacks', adminCallbacksRouter);

// Serve HTML pages
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/login.html", (req, res) => res.sendFile(path.join(__dirname, "login.html")));
app.get("/register.html", (req, res) => res.sendFile(path.join(__dirname, "register.html")));
app.get("/forgot.html", (req, res) => res.sendFile(path.join(__dirname, "forgot.html")));
app.get("/patient-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "patient-dashboard.html")));
app.get("/doctor-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "doctor-dashboard.html")));
app.get("/admin-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "admin-dashboard.html")));

// Serve CSS
app.use("/styles.css", (req, res) => res.sendFile(path.join(__dirname, "styles.css")));

// 404 handler (must be last)
app.use((req, res) => res.status(404).send("Page not found"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
