const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const cloudinary = require('cloudinary').v2;

async function GetWebThumbnail(web_url) {
  return new Promise(async(resolve,reject)=>{
    try {
      const config = {
        method: 'POST',
        url: 'https://chrome.browserless.io/screenshot',
        params: { token: process.env.BROWSERLESS_TOKEN },
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        data: { 
          url: web_url, 
          gotoOptions: { waitUntil: "networkidle2"}, 
          options: { type: 'jpeg', quality: 100, encoding: "base64" }, 
          viewport: { width: 1920, height: 1080 },
        },
      };
  
      const response = await axios.request(config);
      const image = response.data;

      const filename = moment().unix();  
      const cloud_url = await AddToCloud(image,filename);
      
      resolve(cloud_url);
    } catch (error) {
      console.log("======== NEW ERROR ========");
      console.error(error.message);
      reject(false); 
    }
  })
}

async function AddToCloud(arraybuffer,filename){
  return new Promise(async(resolve,reject)=>{

    try{

      /* cloudinary configuration */ 
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const fileDataAsString = `data:image/jpeg;base64,${arraybuffer}`;

      const cloud_res = await cloudinary.uploader.upload(fileDataAsString, { public_id: filename, resource_type: "image" });
      const { url } = cloud_res;
      resolve(url);
    }
    catch(error){
      console.log("======== ERROR MESSAGE =========");
      console.log(error.message,error.name);
      // console.log(error)
      reject(error);
    }
  })
}

module.exports = GetWebThumbnail;
