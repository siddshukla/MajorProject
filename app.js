const express=require("express");
const path=require("path");
const app=express();
const methodOverride=require("method-override") 
const mongoose=require("mongoose");
const Listing=require("./models/listing.js")
const ejsMate=require('ejs-mate');

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")))
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.engine("ejs",ejsMate);

const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}
app.get('/',(req,res)=>{
    res.send("home Rout!")
})
app.get('/listings',async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings})
})
//New route
app.get('/listings/new',(req,res)=>{
    res.render("listings/new.ejs")
})
//Show route
app.get('/listings/:id',async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})
//create route
app.post('/listings',async (req,res)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})
//edit route
app.get('/listings/:id/edit',async (req,res)=>{
    let { id }=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
})
//update route
app.put('/listings/:id',async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`)
})

//delete route
app.delete('/listings/:id',async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndDelete(id);
    res.redirect("/listings")
})

// app.get('/',(req,res)=>{
//     res.send("hey ,im root!");
// });

// app.get('/testListing',async (req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
//     })

//     await sampleListing.save();
//     console.log("sample was saved!")
//     res.send("successfull");
// });

app.listen(8080,()=>{
    console.log("listening!");
});