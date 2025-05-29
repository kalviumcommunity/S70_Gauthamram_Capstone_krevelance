const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("./config/passport").passport;
const analysisRoutes = require("./routes/analysisRoutes");
const reportRoutes = require("./routes/reportRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingsRoutes = require('./routes/settingsRoutes');

const connectDB = require("./config/db");

const app = express();
app.use(express.json());


app.use(passport.initialize());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:1613",
     methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);



app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/report", reportRoutes);
app.use('/api/notifications', notificationRoutes); 
app.use('/api/settings', settingsRoutes);


app.get("/", (req, res) => {
  res.send("server is running...");
});

app.get("/dashboard", (req, res) => {
  const frontendDashboardUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL}/dashboard`
    : "/dashboard";
  return res.redirect(frontendDashboardUrl);
});


app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); 
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 1316;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); 
  });

