const express = require('express')
const status = require('./status')
const controller = require('./controller')
const { port } = require('./config')
const { version } = require('../package.json')
const { runUi } = require('./auth/index')

const app = express()
app.use(express.json())

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Log error to console but don't send it to the client to avoid leaking data
app.use((err, req, res, next) => {
  if (err) {
    console.error(err)
    return res.sendStatus(500)
  }
  next()
})

app.get('/', status.index)
app.get('/jobs', status.getJob)
app.get('/status', status.status)
app.post('/relay', controller.shieldingWithdraw)
runUi(app)

app.listen(port)
console.log(`Relayer server ${version} started on port ${port}`)
