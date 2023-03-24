const express = require('express');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Models = require('./models');


const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/nicCage', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static("public"));

app.use(morgan('common'));

let myLogger = (req, res, next) => {
    console.log(req .url);
    next();
  };
  
  let requestTime = (req, res, next) => {
    req.requestTime = Date.now();
    next();
  };

  app.use(myLogger);
  app.use(requestTime);




// endpoints
app.post('/users', (req, res) => {
    const newUser = new Users(req.body);
    newUser.save((err, user) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(201).send(user);
      }
    });
  });
  app.get('/users', (req, res) => {
    Users.find((err, users) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(users);
      }
    });
  });
  app.get('/users/:userId', (req, res) => {
    Users.findById(req.params.userId, (err, user) => {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res.status(404).send("User not found.");
      } else {
        res.status(200).send(user);
      }
    });
  });
  app.put('/users/:userId', (req, res) => {
    Users.findById(req.params.userId, (err, user) => {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res.status(404).send("User not found.");
      } else {
        user.name = req.body.name || user.name;
        user.username = req.body.username || user.username;
        user.password = req.body.password || user.password;
        user.email = req.body.email || user.email;
        user.birthday = req.body.birthday || user.birthday;
  
        user.save((err, updatedUser) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send(updatedUser);
          }
        });
      }
    });
  });
  app.delete('/users/:userId', (req, res) => {
    Users.findByIdAndRemove(req.params.userId, (err, user) => {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res.status(404).send("User not found.");
      } else {
        res.status(200).send(`User ${user.username} successfully deleted.`);
      }
    });
  });  
  app.post('/movies', (req, res) => {
    const newMovie = new Movies(req.body);
    newMovie.save((err, movie) => {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(201).send(movie);
      }
    });
  });
  app.get('/movies', (req, res) => {
    Movies.find((err, movies) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(movies);
      }
    });
  });
  app.get('/movies/:movieId', (req, res) => {
    Movies.findById(req.params.movieId, (err, movie) => {
      if (err) {
        res.status(500).send(err);
      } else if (!movie) {
        res.status(404).send("Movie not found.");
      } else {
        res.status(200).send(movie);
      }
    });
  });
  app.get('/genres', (req, res) => {
    Genres.find((err, genres) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(genres);
      }
    });
  });
  app.get('/genres/:genreId', (req, res) => {
    Genres.findById(req.params.genreId, (err, genre) => {
      if (err) {
        res.status(500).send(err);
      } else if (!genre) {
        res.status(404).send("Genre not found.");
      } else {
        res.status(200).send(genre);
      }
    });
  });
  app.get('/genres/:name', (req, res) => {
    Genres.findOne({ name: req.params.name }, (err, genre) => {
      if (err) {
        res.status(500).send(err);
      } else if (!genre) {
        res.status(404).send("Genre not found.");
      } else {
        res.status(200).send(genre);
      }
    });
  });

  app.get('/movies/:title', (req, res) => {
    Movies.findOne({ title: req.params.title }, (err, movie) => {
      if (err) {
        res.status(500).send(err);
      } else if (!movie) {
        res.status(404).send("Movie not found.");
      } else {
        res.status(200).send(movie);
      }
    });
  });
  app.get('/directors/:name', (req, res) => {
    Directors.findOne({ name: req.params.name }, (err, director) => {
      if (err) {
        res.status(500).send(err);
      } else if (!director) {
        res.status(404).send("Director not found.");
      } else {
        res.status(200).send(director);
      }
    });
  });
  app.post('/users/:userId/movies/:movieId', (req, res) => {
    Users.findById(req.params.userId, (err, user) => {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res.status(404).send("User not found.");
      } else {
        Movies.findById(req.params.movieId, (err, movie) => {
          if (err) {
            res.status(500).send(err);
          } else if (!movie) {
            res.status(404).send("Movie not found.");
          } else {
            if (user.favoriteMovies.includes(movie._id)) {
              res.status(409).send("Movie already in favorites list.");
            } else {
              user.favoriteMovies.push(movie._id);
              user.save((err, updatedUser) => {
                if (err) {
                  res.status(500).send(err);
                } else {
                  res.status(201).send(updatedUser);
                }
              });
            }
          }
        });
      }
    });
  });
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  }); 
        