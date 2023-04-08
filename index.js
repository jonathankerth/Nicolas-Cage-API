const express = require('express');
const morgan = require('morgan');

const app = express();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Models = require('./models');
const bodyParser = require('body-parser');

const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/nicCage', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
const connectionUri = process.env.CONNECTION_URI;

if (!connectionUri) {
  console.error('MongoDB connection string is missing');
  process.exit(1);
}

mongoose.connect(connectionUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(express.static('public'));

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app);

const cors = require('cors');
app.use(cors());

const passport = require('passport');
const { query } = require('express');
require('./passport');

// endpoints

// Endpoint for '/'
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!');
  });
  
  // Endpoint for '/favicon.ico'
  app.get('/favicon.ico', (req, res) => {
  // Send a 204 No Content status code
  res.status(204).end();
  });

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', [
  check('username', 'Username is required').isLength({min: 5}),
  check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'Password is required').not().isEmpty(),
  check('email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  console.log('body:', req.body);
  let hashedPassword = Users.hashPassword(req.body.password);

  Users.findOne({Username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).json({ message: req.body.username + ' already exists' });
      } else {
        Users.create({
          Username: req.body.username,
          Password: hashedPassword,
          Email: req.body.email,
          Birthday: req.body.birthday
        })
        .then((user) => {
          res.status(201).json(user);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).json({ message: 'Error: ' + error });
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: 'Error: ' + error });
    });
});

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.params.Username + ' not found');
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.username },
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday,
      },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.params.username + ' not found');
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.params.Username + ' not found');
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Delete a movie to a user's list of favorites
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(400).send(req.params.Username + ' not found');
      }
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error:' + error);
    });
});

// Get a movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send(req.params.title + ' not found');
      }
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a genre by name
app.get('/genre/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.name': req.params.name })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send(req.params.name + ' not found');
      }
      res.json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a director by name
app.get('/director/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.name': req.params.name })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send(req.params.name + ' not found');
      }
      res.json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Error handling

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});