const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Image = require("./models/image.js");
const app = express();
const dbUrl = "";
const cookieParser = require('cookie-parser')
const multer = require('multer')
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: "",
    api_key: "",
    api_secret: "",
});

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => app.listen(process.env.PORT || 3000))
    .catch(err => console.log(err));


//register view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "DEV",
    },
});

app.use(cookieParser())
const upload = multer({ storage: storage }).fields([{name: "avatar"}, {name: "image"}]);;

app.get("/", (req, res) => {
    Image.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('index', {list: result});
        })
        .catch(err => {
            console.log(err);
        });
})

app.post("/like/:id", async (req, res) => {
    Image.findById(req.params.id)
        .then((result) => {
            return result.like;
        })
        .then((result) => {
            Image.findByIdAndUpdate(req.params.id, {like: ++result})
                .then((result) => {})
                .catch(error => {
                    console.log(error);
                })
        })   
})

app.post("/unlike/:id", async (req, res) => {
    Image.findById(req.params.id)
        .then((result) => {
            return result.like;
        })
        .then((result) => {
            Image.findByIdAndUpdate(req.params.id, {like: --result})
                .then((result) => {})
                .catch(error => {
                    console.log(error);
                })
        })   
})

app.delete("/delete/:id", (req, res) => {
    Image.findByIdAndDelete(req.params.id)
        .then((result) => {
        })
        .catch(err => {
            console.log(err);
        })
})

app.get("/create", (req, res) => {
    res.render('create')
})

app.post("/create", upload, (req, res) => {
    let newPost;
    if(req.cookies.name && req.cookies.avatar) {
        const imageUrl = req.files.image[0].path;
        newPost = new Image({
            ...req.body,
            name: req.cookies.name,
            avatar: req.cookies.avatar,
            image: imageUrl,
            like: 0,
        })
    } else {
        const avatarUrl = req.files.avatar[0].path;
        const imageUrl = req.files.image[0].path;
        res.cookie("avatar", avatarUrl);
        res.cookie("name", req.body.name);
        newPost = new Image({
            ...req.body,
            avatar: avatarUrl,
            image: imageUrl,
            like: 0,
        })
    }

    newPost.save()
        .then(result => {
            res.redirect("/");
        })
        .catch(err => {
            console.log(err);
        });
})
