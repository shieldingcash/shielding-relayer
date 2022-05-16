const Web3 = require('web3')
const Redis = require('ioredis')
const { toBN } = require('web3-utils')

const { setSafeInterval } = require('./utils')
const { redisUrl, httpRpcUrl } = require('./config')

const web3 = new Web3(httpRpcUrl)
const redis = new Redis(redisUrl)

async function main() {
  try {
    try {
      // TODO: to add code to fetch gas price
      const block = await web3.eth.getBlock('latest')
      let gasPrice = ''
      if (block && block.baseFeePerGas) {
        const baseFeePerGas = toBN(block.baseFeePerGas)
        gasPrice = baseFeePerGas
      } else {
        gasPrice = 100
      }
      await redis.set('gasPrice', gasPrice)
    } catch (e) {
      console.log('gasPrice error=', e.message)
    }

    try {
      // Set eth prices.
      // TODO: add code to fetch prices.
      // await redis.hset('prices', 'a', 124)
    } catch (e) {
      console.log('prices error=', e.message)
    }
  } catch (e) {
    console.log('error=', e.message)
  }
}

setSafeInterval(main, 30 * 1000)
