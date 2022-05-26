const express = require('express')
const Queue = require('bull')
const { createBullBoard } = require('@bull-board/api')
const { BullAdapter } = require('@bull-board/api/bullAdapter')
const { ExpressAdapter } = require('@bull-board/express')

const proofsQueue = new Queue('proofs', {
  redis: { port: 6379, host: '127.0.0.1', password: '' },
}) // If you have a special connection to redis.

const serverAdapter = new ExpressAdapter()

createBullBoard({
  queues: [new BullAdapter(proofsQueue)],
  serverAdapter: serverAdapter,
})

const app = express()

serverAdapter.setBasePath('/admin/queues')
app.use('/admin/queues', serverAdapter.getRouter())

function index(req, res) {
  res.send('Dashboard  <a href=/admin/queues>/admin/queues</a> ')
}

app.get('/', index)

app.listen(10053)
// other configurations of your server
