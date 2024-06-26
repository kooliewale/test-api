const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require('axios');
const app = express();
const url = require('url'); // Assuming you need the 'url' module
const PORT = process.env.PORT || 4500;
const { createClient } = require('@supabase/supabase-js');
const BASE_URI = 'https://api.weatherapi.com/v1';
app.use(bodyParser.json());
app.use(cors());
var DATA = [];

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


const logRequest = (req, res, next) => {
  // console.log(`--- Request Details ---`);
  // console.log(`Method: ${req.method}`);
  // console.log(`URL: ${req.url}`);
  // console.dir(req.headers); // Use console.dir for better formatting
  // console.dir(req.body);   // Access body data for POST requests (if applicable)


  DATA['REQ_URL'] = req.url;


  next();
};

// Apply the middleware to handle all requests
app.use(logRequest);

app.all('*', (req, res) => {
  
  if (req.url.match('current.json')) {
    const url = `${BASE_URI}${req.url}`;
 
    axios.get(url)
      .then(response => {
        res.send(response.data);
        DATA['SERVER_SENT_BACK'] = response.data;
        // console.log(DATA);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        res.status(500).send('Error retrieving weather data'); // Handle errors gracefully
      });
  } else {
    // Handle other requests based on your needs
    // You can send an informative message or a default response here
    res.status(404).send('Not Found');
  }
  const city = req.headers['x-vercel-ip-city'];
const region = req.headers['x-vercel-ip-country-region'];
const country = req.headers['x-vercel-ip-country'];
console.log(DATA);
const supabaseData = {
    REQ_URL: DATA['REQ_URL'],
    SERVER_SENT_BACK: DATA['SERVER_SENT_BACK'],
    IP: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    lat: req.headers['x-vercel-ip-latitude'],
    lon: req.headers['x-vercel-ip-longitude'],
    place: `${city}, ${region}, ${country}`,
    UA: req.headers['user-agent'],
   date_time: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
};

    supabase
    .from('datatest')
    .insert(supabaseData)
    .then(response1 => {
      console.log('Data sent to Supabase successfully:', response1);
    })
    .catch(error1 => {
      console.error('Error sending data to Supabase:', error1);
    });
});

app.listen(PORT, () => {
  console.log(`Weather API Proxy listening on port ${PORT}`);
});
