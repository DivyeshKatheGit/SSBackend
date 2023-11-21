const express = require('express');
const mongoose = require('mongoose');

const wavesSchema = require('./mongodb/waves');
const GetWebThumbnail = require('./utils/GetWebThumbnail');
const GetWebTitle = require('./utils/GetWebTitle');

require('dotenv').config();

/* database connection */
mongoose.connect(process.env.MONGODB_CONNECTION_URL);

/* app configuration */
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



/* routes */

app.post('/waves', async(req, res) => {

    let {web_title=false,web_url} = req.body;
    try{

        const thumbnail = await GetWebThumbnail(web_url);
        if(!web_title){
            web_title = await GetWebTitle(web_url);
        };

        const wave = await wavesSchema.create({
            web_title,
            web_url,
            web_thumbnail: thumbnail,
            web_shot: thumbnail,
            user_id: '55a0f42f20a4d760b5fc305e',
            board_id: '65264c8d9c84ce52e1a84748'
        });

        wave.save();

        res.json({
            error: false
        })
    }
    catch(e){
        res.json({
            error: true,
            message: e.message
        });
    }

});

app.get('/waves', async (req, res) => {

    const waves = await wavesSchema.find({});
    
    res.json({
        error: false,
        data: waves
    })
});

app.get('/', (req, res) => {
    res.json({
        status: 'brainwave API server'
    })
});

app.listen(PORT, () => {
    console.log(`listening to http://localhost:${PORT}`);
})