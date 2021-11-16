const mongoose = require('mongoose');
const {TextDecoder, TextEncoder} = require("util");
const { Schema } = mongoose;

const imageSchema = new Schema({
    name: String,
    avatar: String,
    image: {
        type: String,
        required: true,
    },
    caption: String,
    like: Number,
}, { timestamps: true })

const Image = mongoose.model('images', imageSchema);

module.exports = Image;