const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const cloudinary = require('cloudinary').v2;

async function GetWebThumbnail(web_url) {
  try {
    return new Promise(async (resolve,reject)=>{
      const config = {
        method: 'POST',
        url: 'https://chrome.browserless.io/screenshot',
        params: { token: process.env.BROWSERLESS_TOKEN },
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
        },
        data: { url: web_url, gotoOptions: { waitUntil: "networkidle2"}, options: { type: 'jpeg', quality:100 } },
        responseType: 'arraybuffer',
      };
  
      const response = await axios.request(config);
      const image = response.data;
  
      const filename = moment().unix();
      
      const filepath = await StoreFile(filename,image);
  
      const cloud_url = await AddToCloud(filepath,filename);
      resolve(cloud_url);

    })

  } catch (error) {
    console.error('Error:', error);
    throw error; 
  }
}

async function StoreFile(filename,data){
  const filepath = path.join(__dirname,'../',`uploads/${filename}.jpeg`);
  await fs.writeFileSync(filepath,data);
  return filepath;
}

async function AddToCloud(filepath,filename){
  return new Promise(async(resolve,reject)=>{

    try{

      /* cloudinary configuration */ 
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const cloud_res = cloudinary.uploader.upload(filepath, { public_id: filename });
      cloud_res.then(async (data) => {
        fs.unlink(filepath, (err) => { console.log(err) });
        const {url} = data;
        resolve(url);
    
      }).catch((err) => {
        reject(false);
      });
    }
    catch(error){
      reject(false);
    }
  })
}

module.exports = GetWebThumbnail;
