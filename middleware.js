const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { lsitingschema,reviewschema } = require("./schema.js");
const Review = require("./models/review");

module.exports.isLoggedIn=(req,res,next)=>{
  if (!req.isAuthenticated()) {
      req.session.redirectUrl=req.originalUrl;
      req.flash("error","you must logged in to create listings!");
      return res.redirect("/login")
  }
  next();
};
module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
      res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner=async(req,res,next)=>{
  let { id } = req.params;
      let listing=await Listing.findById(id);
      if (!listing.owner._id.equals(res.locals.currUser._id)) {
        req.flash("error","You are not authorized to update this listing!");
        return res.redirect(`/listings/${id}`);
        
      }
      next();
}
module.exports.validateListing=(req,res,next)=>{
  const {error} = lsitingschema.validate(req.body);
    if (error) {
      let errMsg=error.details.map((el)=>el.message).join(',');
      throw new ExpressError(400,errMsg); // Include detailed validation error
    }
    else{
      next();
    }
}

module.exports.validateReview=(req,res,next)=>{
  const {error} = reviewschema.validate(req.body);
    if (error) {
      let errMsg=error.details.map((el)=>el.message).join(',');
      throw new ExpressError(400,errMsg); // Include detailed validation error
    }
    else{
      next();
    }
}

module.exports.isReviewAuthor=async(req,res,next)=>{
  let {id,reviewId}=req.params;
  let review=await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error","You are not authorized to delete this review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}