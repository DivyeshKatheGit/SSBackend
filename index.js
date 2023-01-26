const express = require('express');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 4040;

app.use(express.json({ limit: '50mb' }));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Configuration 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const SHEETS_URL = process.env.SHEETS_URL;

let images_array = [];

const UploadToSheet = async(id, image, url) => {
    const response = await axios.post(`${SHEETS_URL}?route=add_bookmark&id=${id}&image=${image}&url=${url}`);
    return response;
};

app.post('/upload', (req, res) => {

    const { image,url } = req.body;

    base64Data = image.replace(/^data:image\/jpeg;base64,/, ""),
        binaryData = Buffer.from(base64Data, 'base64').toString('binary');

    const filename = moment().unix();

    const filepath = __dirname + `/uploads/${filename}.jpeg`;

    fs.writeFile(`${filepath}`, binaryData, "binary", function (err) {
        console.log(err); // writes out file without error, but it's not a valid image
    });

    const cloud_res = cloudinary.uploader.upload(filepath, { public_id: filename });
    cloud_res.then(async (data) => {
        images_array.push(data.secure_url);
        const sheet_upload_response = await UploadToSheet(filename,data.secure_url,url);
        fs.unlink(filepath,(err)=> {console.log(err)});
        res.json({
            error: false,
            images: images_array
        });
    }).catch((err) => {
        res.json({
            error: true,
        });
    });


});

app.get('/images', (req, res) => {

    let urls = [];
    images_array.map((image) => {
        const url = cloudinary.url(image, {
            width: 100,
            height: 150,
            Crop: 'fill'
        });
        urls.push(url)
    });

    res.json({
        error: false,
        urls: urls
    });

});

app.get('/', (req, res) => {
    res.json({
        status: 'this is a server'
    })
});

app.listen(PORT, () => {
    console.log(`listening to http://localhost:${PORT}`);
})