const express = require("express");
const cors = require("cors");
require("dotenv").config();
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes'); 
const connectDB = require("./config/db");


const app = express();
app.use(cors());
app.use(express.json())



app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000,
    }
}));;

app.use(passport.initialize());
app.use(passport.session());


app.use("/api/auth", authRoutes);
app.use('/api/dashboard', dashboardRoutes);


connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
  });
});
