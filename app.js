const express = require("express");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { lsitingschema ,reviewschema} = require("./schema.js");
const Review = require("./models/review.js");

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

const validateListing=(req,res,next)=>{
  const {error} = lsitingschema.validate(req.body);
    if (error) {
      let errMsg=error.details.map((el)=>el.message).join(',');
      throw new ExpressError(400,errMsg); // Include detailed validation error
    }
    else{
      next();
    }
}
const validateReview=(req,res,next)=>{
  const {error} = reviewschema.validate(req.body);
    if (error) {
      let errMsg=error.details.map((el)=>el.message).join(',');
      throw new ExpressError(400,errMsg); // Include detailed validation error
    }
    else{
      next();
    }
}
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

// Create route
app.post(
  "/listings",validateListing,
  wrapAsync(async (req, res, next) => {
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

// Edit route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

// Update route
app.put(
  "/listings/:id",validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing) {
      throw new ExpressError(400, "Send valid data for listing");
    }
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  })
);

// Delete route
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

//Reviews route
app.post('/listings/:id/reviews',validateReview,wrapAsync(async (req,res)=>{
  let listing=await Listing.findById(req.params.id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`)
}))

//delete review route

app.delete('/listings/:id/reviews/:reviewId',async (req,res)=>{
  let {id,reviewId}=req.params;
  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`)
})

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
