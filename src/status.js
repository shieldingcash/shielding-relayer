const queue = require('./queue')
const { netId, instances, redisUrl, shieldingWithdrawFee, relayerAddress } = require('./config')
const { version } = require('../package.json')
const Redis = require('ioredis')
const redis = new Redis(redisUrl)

async function status(req, res) {
  let ethPrices = { }
  try {
    ethPrices = await redis.hgetall('prices')
  } catch (e) {
  }
  const gasPrices = await redis.get('gasPrice')
  const health = await redis.hgetall('health')
  const relayerServiceFee = shieldingWithdrawFee

  const { waiting: currentQueue } = await queue.queue.getJobCounts()

  res.json({
    'data': {
       relayerServiceFee,
       relayerAddress,
       instances: instances[`netId${netId}`],
       netId,
       ethPrices,
       gasPrices,
       version,
       health,
       currentQueue,
    }
  })
}

function index(req, res) {
  res.send(
    'This is <a href=https://shielding.cash>shielding.cash</a> Relayer service. Check the <a href=/status>/status</a> for settings',
  )
}

async function getJob(req, res) {
  const status = await queue.getJobStatus(req.params.id)
  return status ? res.json(status) : res.status(400).json({ error: "The job doesn't exist" })
}

module.exports = {
  status,
  index,
  getJob,
}
