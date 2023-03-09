const express = require('express'),
morgan = require('morgan');

const app = express();

app.use(morgan('common'));

let myLogger = (req, res, next) => {
    console.log(req.url);
    next();
  };
  
  let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
  };

  app.use(myLogger);
  app.use(requestTime);
  app.use('public/documentation.html', express.static('public'));

  const topMovies = [
    {
      title: "The Godfather",
      director: "Francis Ford Coppola",
      year: 1972
    },
    {
      title: "The Shawshank Redemption",
      director: "Frank Darabont",
      year: 1994
    },
    {
      title: "The Dark Knight",
      director: "Christopher Nolan",
      year: 2008
    },
    {
        title: "Finding Nemo",
        director: "Andrew Stanton",
        year: 2003
      },
      {
        title: "Finding Dory",
        director: "Andrew Stanton",
        year: 2016
      },
      {
        title: "National Treasure",
        director: "Jon Turteltaub",
        year: 2004
      },
      {
        title: "National Treasure 2",
        director: "Jon Turteltaub",
        year: 2007
      },
      {
        title: "Lord of War",
        director: "Andrew Niccol",
        year: 2005
      },
      {
        title: "Ghost Rider",
        director: "Mark Steven Johnson",
        year: 2007
      },
      {
        title: "Pig",
        director: "Michael Sarnoski",
        year: 2021
      },
  ];
  
  app.get('/movies', (req, res) => {
    let responseText = 'List of movies';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.json(topMovies);
  
  });

  app.get('/', (req, res) => {
    let responseText = 'Welcome to my Nicolas Cage app!';
    responseText += '<small>Requested at: ' + req.requestTime + '</small>';
    res.send(responseText);
  });
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });