const express = require('express')
const status = require('./status')
const controller = require('./controller')
const { port } = require('./config')
const { version } = require('../package.json')
const { isAddress } = require('web3-utils')

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
app.get('/jobs/:id', status.getJob)
app.get('/status', status.status)
app.post('/relay', controller.shieldingWithdraw)

app.listen(port)
console.log(`Relayer ${version} started on port ${port}`)
