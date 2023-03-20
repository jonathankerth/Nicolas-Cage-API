const bodyParser = require('body-parser');

const express = require('express'),
morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

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
  
// Return a list of ALL movies to the user
app.get('/movies', (req, res) => {
  res.send(topMovies);
});

// Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', (req, res) => {
  const title = req.params.title;
  res.send(`Return data about the movie with the title ${title}`);
});

// Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/genres/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Return data about the genre with the name ${name}`);
});

// Return data about a director (bio, birth year, death year) by name
app.get('/directors/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Return data about the director with the name ${name}`);
});

// Allow new users to register
app.post('/users/register', (req, res) => {
  res.send('Allow new users to register');
});

// Allow users to update their user info (username)
app.put('/users/:email', (req, res) => {
  const email = req.params.email;
  res.send(`Allow user with email ${email} to update their user info`);
});

// Allow users to add a movie to their list of favorites (showing only a text that a movie has been added—more on this later)
app.post('/users/:email/favorites', (req, res) => {
  const email = req.params.email;
  res.send(`Allow user with email ${email} to add a movie to their list of favorites`);
});

// Allow users to remove a movie from their list of favorites (showing only a text that a movie has been removed—more on this later)
app.delete('/users/:email/favorites/:title', (req, res) => {
  const email = req.params.email;
  const title = req.params.title;
  res.send(`Allow user with email ${email} to remove the movie with the title ${title} from their list of favorites`);
});

// Allow existing users to deregister (showing only a text that a user email has been removed—more on this later)
app.delete('/users/:email', (req, res) => {
  const email = req.params.email;
  res.send(`Allow user with email ${email} to deregister`);
});

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });