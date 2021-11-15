const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const Image = require("./models/image.js");
const app = express();
const dbUrl = "mongodb+srv://hiepnk223:hiepnk223@cluster0.e1x3r.mongodb.net/hiepnguyen?retryWrites=true&w=majority";
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser')


mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => app.listen(200))
    .catch(err => console.log(err));

//register view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cookieParser())

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

const writeImage = ({image, name}) => {
    const uploadPath = __dirname + '/public/images/' + name;
    image.mv(uploadPath, function(err) {
        if (err) {
            console.log(err);
        }
    });
}

app.post("/create",  (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const imageName = `${req.body.name}${req.files.image.name}`.replace(/\s/g, '');

    let newImage;
    if(req.cookies.name && req.cookies.avatar) {
        newImage = new Image({
            ...req.body,
            name: req.cookies.name,
            avatar: req.cookies.avatar,
            image: `/images/${imageName}`,
            like: 0,
        })
    } else {
        const avatarName = `${req.body.name}${req.files.avatar.name}`.replace(/\s/g, '');

        //save name and avatar to cookie
        res.cookie("name", req.body.name);
        res.cookie("avatar", `/images/${avatarName}`);

        writeImage({image: req.files.avatar, name: avatarName});

        newImage = new Image({
            ...req.body,
            avatar: `/images/${avatarName}`,
            image: `/images/${imageName}`,
            like: 0,
        })
    }
    writeImage({image: req.files.image, name: imageName});

    newImage.save()
        .then(result => {
            res.redirect("/");
        })
        .catch(err => {
            console.log(err);
        });
})