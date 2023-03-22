const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/nicCage', { useNewUrlParser: true, useUnifiedTopology: true });

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

//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
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
  // Get all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
// Delete a user by username
app.delete('/users/:Username', (req, res) => {
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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, () => {
  console.log('Your app is listening on port 3000.');
});
