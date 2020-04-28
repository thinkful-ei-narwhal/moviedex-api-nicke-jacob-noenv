const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const data = require('./movies-data-small.json');
require('dotenv').config();

const app = express();
app.use(morgan('default'));
app.use(cors());
app.use(helmet());

const API_TOKEN = process.env.API_TOKEN;


function requireAuth(req, res, next) {
  const authValue = req.get('Authorization') || ' ';



  //verify bearer
  if (!authValue.toLowerCase().startsWith('bearer')) {
    return res.status(400).json({ error: 'Missing bearer token' });
  }

  const token = authValue.split(' ')[1];

  if (token !== API_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next();
}

app.use(requireAuth);




// Users can search for Movies by genre, country or avg_vote

//NOTE: We don't have best practice right now, it allows for everything
//The endpoint should have general security in place such as best practice headers and support for CORS
app.get('/movie', (req, res) => {
  const genre = req.query.genre;
  const country = req.query.country;
  const avg_vote = req.query.avg_vote;
  let returnData = [...data];


  if (genre) {
    let genreLC = genre.toLowerCase();
    returnData = returnData.filter(data => data.genre.toLowerCase().includes(genreLC));
  }

  if(country) {
    let countryLC = country.toLowerCase();
    returnData = returnData.filter(data => data.country.toLowerCase().includes(countryLC) )
  }
  
  if(avg_vote) {
    returnData = returnData.filter(data => data.avg_vote >= avg_vote)
    returnData = returnData.sort((a, b) => { return a.avg_vote - b.avg_vote })
  }

  // When searching by country, users are searching for whether the Movie's country includes a specified string. The search should be case insensitive.

  // When searching by average vote, users are searching for Movies with an avg_vote that is greater than or equal to the supplied number.


  res.status(200).json(returnData);
});

app.listen(9000, () => console.log('Server listening at http://localhost:9000'));