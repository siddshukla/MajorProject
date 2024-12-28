const express = require("express");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings=require('./routes/listing.js')
const reviews=require('./routes/review.js')

// Middleware setup
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MongoDB connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// Routes
app.get("/", (req, res) => {
  res.send("home Route!");
});

//listings
app.use('/listings',listings);
//reviews
app.use('/listings/:id/reviews',reviews)


// 404 error handling
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { statusCode, message });
});
// Start server
app.listen(8080, () => {
  console.log("listening!");
});
