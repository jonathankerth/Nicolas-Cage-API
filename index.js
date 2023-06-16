const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const { check, validationResult } = require('express-validator')
const mongoose = require('mongoose')
const Models = require('./models')
const bodyParser = require('body-parser')

const Movies = Models.Movie
const Users = Models.User

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:4200',
  'https://main--niccagecllient.netlify.app',
  'http://localhost:1234',
  'https://myflixdb.herokuapp.com',
  'https://niccage.herokuapp.com',
  'https://niccagecllient.netlify.app',
  'https://main--niccagecllient.netlify.app/',
  'https://niccagecllient.netlify.app/',
  '*',
]

app.use(
  cors({
    origin: allowedOrigins,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
)

app.use(express.static('public'))

app.use(morgan('common'))

let myLogger = (req, res, next) => {
  console.log(req.url)
  next()
}

let requestTime = (req, res, next) => {
  req.requestTime = Date.now()
  next()
}

app.use(myLogger)
app.use(requestTime)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./auth')(app)

const passport = require('passport')
require('./passport')

// endpoints

// Endpoint for '/'
app.get('/', (req, res) => {
  res.send('Welcome to my movie API!')
})
//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non-alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').notEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail(),
    check('Birthday', 'Birthday is required').notEmpty(),
  ],
  (req, res) => {
    let errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    let hashedPassword = Users.hashPassword(req.body.Password)

    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).json({ message: 'Username already exists' })
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json({ message: 'User created successfully' })
            })
            .catch((error) => {
              console.error(error)
              res.status(500).json({ message: 'Error creating user' })
            })
        }
      })
      .catch((error) => {
        console.error(error)
        res.status(500).json({ message: 'Error finding user' })
      })
  }
)

// Get all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

// Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          return res.status(400).send(req.params.Username + ' not found')
        }
        res.json(user)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

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
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
          return res.status(400).send(req.params.username + ' not found')
        }
        res.json(user)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

// Delete a user by username
app.delete(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found')
        } else {
          res.status(200).send(req.params.Username + ' was deleted.')
        }
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

app
  .route('/users/:Username/movies/:MovieId')
  .get(passport.authenticate('jwt', { session: false }), (req, res) => {
    // Handle GET request
  })
  .post((req, res) => {
    const { Username, MovieId } = req.params

    Users.findOneAndUpdate(
      { Username },
      { $push: { FavoriteMovies: MovieId } },
      { new: true }
    )
      .populate('FavoriteMovies')
      .then((user) => {
        if (!user) {
          return res.status(400).send(`${Username} not found`)
        }

        res.json(user)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  })
  .put(passport.authenticate('jwt', { session: false }), (req, res) => {
    // Handle PUT request
  })
  .delete(passport.authenticate('jwt', { session: false }), (req, res) => {
    const { Username, MovieId } = req.params

    Users.findOneAndUpdate(
      { Username },
      { $pull: { FavoriteMovies: MovieId } },
      { new: true }
    )
      .populate('FavoriteMovies')
      .then((user) => {
        if (!user) {
          return res.status(400).send(`${Username} not found`)
        }
        res.json(user)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  })

// Get all movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies)
    })
    .catch((error) => {
      console.error(error)
      res.status(500).send('Error:' + error)
    })
})

// Get a movie by title
app.get('/movies/:title', (req, res) => {
  Movies.findOne({ title: req.params.title })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send(req.params.title + ' not found')
      }
      res.json(movie)
    })
    .catch((err) => {
      console.error(err)
      res.status(500).send('Error: ' + err)
    })
})

// Get a genre by name
app.get(
  '/genre/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.name': req.params.name })
      .then((movie) => {
        if (!movie) {
          return res.status(400).send(req.params.name + ' not found')
        }
        res.json(movie.Genre)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

// Get a director by name
app.get(
  '/director/:name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.name': req.params.name })
      .then((movie) => {
        if (!movie) {
          return res.status(400).send(req.params.name + ' not found')
        }
        res.json(movie.Director)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

// Error handling

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const port = process.env.PORT || 8080
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port)
})
