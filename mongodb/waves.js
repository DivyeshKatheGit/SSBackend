const mongoose = require('mongoose');
const moment = require('moment');

/*
  web_title: title of the webpage (website name)
  web_url: url of the webpage
  web_thumbnail: thumbnail image of the webpage
  web_shot: fullscreen screenshot of the website
  insertion_time: added timestamp of the item
  user_id: user id of the item owner
  board_id: board id where the item is stored
*/


const wavesSchema = new mongoose.Schema({
  web_title: String,
  web_url: String,
  web_thumbnail: String,
  web_shot: String,
  insertion_time: {
    type: Number,
    default: ()=> moment().unix()
  },
  user_id: String,
  board_id: String
});

module.exports = mongoose.model("waves",wavesSchema);