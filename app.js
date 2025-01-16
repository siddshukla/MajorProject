if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session")
const MongoStore=require("connect-mongo");

const flash=require("connect-flash")
const passport=require("passport");
const LocalStrategy=require("passport-local");

const listingRouter=require('./routes/listing.js')
const reviewRouter=require('./routes/review.js')
const userRouter=require('./routes/user.js') 

const User=require("./models/user.js");
const { dot } = require("node:test/reporters");

// Middleware setup
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// MongoDB connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.ATLASDB_URL;

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*60*60,

});

store.on("error",function(e){
  console.log("Session store error",e);
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+ 7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true
  }
}



main()
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

// // Routes
// app.get("/", (req, res) => {
//   res.send("home Route!");
// });

app.use(session(sessionOptions));
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  // console.log(res.locals.success);
  next();
})

// app.get('/demouser',async(req,res)=>{
//   let fakeUser=new User({
//     email:"siddharth@gmail.com",
//     username:"delta-student"
//   });
//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })

//listings
app.use('/listings',listingRouter);
//reviews
app.use('/listings/:id/reviews',reviewRouter);

app.use('/',userRouter);


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
