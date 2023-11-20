const { default: axios } = require('axios');
const cheerio = require('cheerio');

const GetWebTitle = async (urlString) => {
  return new Promise(async(resolve,reject)=>{
    const parsedUrl = new URL(urlString);
    axios.get(parsedUrl).then((response)=>{
      const data = response.data;
      const $ = cheerio.load(data);
      resolve($('title').text())
    });
  })
};

module.exports = GetWebTitle;