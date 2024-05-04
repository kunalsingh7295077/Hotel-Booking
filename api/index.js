const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Place = require('./models/Place');
const CookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const Booking = require('./models/Booking');
require('dotenv').config();
const app = express();



// parsing incoming data to JSON
app.use(express.json());
//accessing cookie coming in httpsrequest header
app.use(CookieParser());
// middleware for displaying static assets
app.use('/uploads', express.static(__dirname + '/uploads'));
//multer / upload middleware
const photosMiddleware = multer({dest : 'uploads'});


// allowing  cross-origin resource sharing (CORS) for domain OR middleware
app.use(cors({
    credentials : true,
    origin : 'http://localhost:5173'
}));


// Connecting with mongodb using mongoose
mongoose.connect(process.env.MONGO_URL)
    .then((db) => {
        console.log("Connected to db");
    })
    .catch((err) => {
        console.log(err);
    })
    

//server listening on PORT 4000

app.listen(process.env.PORT || 5000 , ()=>{
    console.log(`Server started..`);
});

//testing purposes

app.get('/test' , (req , res) =>{
    res.json('test ok');
});

function getUserDataFromToken(req){
    return new Promise((resolve,reject) => {
        jwt.verify(req.cookies.token , process.env.JWT_SECRET , {} , async (err , userData) =>{
            if (err) throw err;
            resolve(userData);
        });
    });
}

//register end point

app.post('/register' , async (req , res) => {
    const {name , email , password} = req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password : bcrypt.hashSync(password , bcrypt.genSaltSync(10)),
        });
        if(userDoc){
            res.status(200).json({success : true});
        }
        else{
            res.status(400).json({success:false});
        }
    }
    catch(err){
        res.status(422).send(err);
    }
}); 


// login end point
app.post('/login' , async (req , res) => {
    const {email , password } = req.body;
    const userDoc = await User.findOne({email});
    if(userDoc){
        const passOk = bcrypt.compareSync(password , userDoc.password);
        if(passOk){
            //  create token and send it to the client side
            jwt.sign({
                email : userDoc.email , 
                id : userDoc._id
                }, process.env.JWT_SECRET , {} , (err ,token)=>{
                if(err) throw err;
                res.cookie('token' , token).json({data : userDoc , success : true});
            });
        }
        else{
            res.json({data : null , success : true , message : "password not correct" });
        }
    }
    else{
        res.json({data : null , success : false , message : "User does not exists"});
    }
});

//profile end point
app.get('/profile' , (req , res) =>{
    const {token} = req.cookies;
    if(token){
        jwt.verify(token , process.env.JWT_SECRET , {} , async (err , userData) =>{
            if(err) throw err;
            const {name , email , _id} = await User.findById(userData.id);
            res.json({name , email , _id});
        })
    }
    else{
        res.json(null);
    }
});

//logout endpoint
app.post('/logout' , (req,res) => {
    res.cookie('token' , '').json(true);
});


//downloading images through url
app.post('/upload-by-link' , async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
        url : link,
        dest : __dirname + '/uploads/'+ newName,
    });
    res.json(newName);
})


//upload end point
app.post('/upload' , photosMiddleware.array('photos' , 100) ,(req,res) => {
    const uploadedFiles = [];
    for(let i = 0 ; i<req.files.length ; i++){
        const {path , originalname} = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length -1];
        const newPath = path + '.' + ext;
        fs.renameSync(path , newPath);
        uploadedFiles.push(newPath.replace('uploads\\' , ''));
    }
    res.json(uploadedFiles);
});


//place end point
app.post('/places' , (req,res) => {
    const {token} = req.cookies;
    const {title , address , addedPhotos , description ,
        perks , extraInfo , checkIn , checkOut , maxGuests , price} = req.body;
    jwt.verify(token , process.env.JWT_SECRET , {} , async (err , userData) =>{
        if(err) throw err;
        const placeDoc = await Place.create({
            owner : userData.id,
            title , address , photos: addedPhotos , description ,
            perks , extraInfo , checkIn , checkOut , maxGuests , price
        })
        res.json(placeDoc);
    });
});

app.get('/user-places' , (req , res) => {
    const {token} = req.cookies;
    jwt.verify(token , process.env.JWT_SECRET , {} , async (err , userData) =>{
        const {id} = userData;
        res.json(await Place.find({owner:id}));
    });

});

app.get('/places/:id' , async (req,res) => {
    const {id} = req.params;
    res.json(await Place.findById(id));
});

app.put('/places' , async (req,res) => {
    const {token} = req.cookies;
    const {id , title , address , addedPhotos , description ,
        perks , extraInfo , checkIn , checkOut , maxGuests , price} = req.body;
    
        jwt.verify(token , process.env.JWT_SECRET , {} , async (err , userData) =>{
        const placeDoc = await Place.findById(id);
        if(userData.id === placeDoc.owner.toString()){
            placeDoc.set({
                title , address , photos: addedPhotos , description ,
                perks , extraInfo , checkIn , checkOut , maxGuests , price 
            })
            await placeDoc.save();
            res.json('ok');
        }
    });
})

app.get('/places' , async (req,res) => {
    res.json(await Place.find());
})

app.post('/bookings' , async (req,res) => {
    const userData = await getUserDataFromToken(req);
    const {place , checkIn ,
         checkOut , numberOfGuests , 
         name , phone , price} = req.body;

    await Booking.create({place , checkIn ,
        checkOut , numberOfGuests , 
        name , phone , price , user : userData.id})
        .then((doc) =>{
            res.status(200).json(doc);
        })
        .catch((err) => {
            throw err;
        })
})


app.get('/bookings' , async (req,res) => {
    const userData = await getUserDataFromToken(req); 
    res.json(await Booking.find({user : userData.id}).populate('place'));
})
