const { createBullBoard } = require('@bull-board/api')
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter')
const { ExpressAdapter } = require('@bull-board/express')
const Queue = require('bull')
const session = require('express-session')
const bodyParser = require('body-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { ensureLoggedIn } = require('connect-ensure-login')
const express = require('express')
const { port } = require('../config')

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(
  new LocalStrategy(function (username, password, cb) {
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASSWORD) {
      return cb(null, { user: 'bull-board' })
    }
    return cb(null, false)
  }),
)

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser((user, cb) => {
  cb(null, user)
})

passport.deserializeUser((user, cb) => {
  cb(null, user)
})

const createQueue = name =>
  new Queue(name, {
    redis: { port: 6379, host: '127.0.0.1', password: '' },
  })

const run = () => {
  const exampleBullMq = createQueue('proofs')

  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/ui')

  createBullBoard({
    queues: [new BullMQAdapter(exampleBullMq)],
    serverAdapter,
  })

  const app = express()
  // Configure view engine to render EJS templates.
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')

  app.use(session({ secret: 'keyboard cat', saveUninitialized: true, resave: true }))
  app.use(bodyParser.urlencoded({ extended: false }))

  // Initialize Passport and restore authentication state, if any, from the session.
  app.use(passport.initialize({}))
  app.use(passport.session({}))

  app.get('/ui/login', (req, res) => {
    res.render('login', { invalid: req.query.invalid === 'true' })
  })

  app.post(
    '/ui/login',
    passport.authenticate('local', { failureRedirect: '/ui/login?invalid=true' }),
    (req, res) => {
      res.redirect('/ui')
    },
  )
  app.use('/ui', ensureLoggedIn({ redirectTo: '/ui/login' }), serverAdapter.getRouter())

  app.listen(port + 1, () => {
    console.log('Running on', port + 1)
    console.log('For the UI, open http://localhost:' + (port + 1) + '/ui')
  })
}

// eslint-disable-next-line no-console
run().catch(e => console.error(e))
