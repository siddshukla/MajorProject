const express=require("express");
const path=require("path");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js")

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","views");
app.set("views",path.join(__dirname,"views"));
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

app.get('/listings',async (req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings})
})

app.get('/listings/:id',async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
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