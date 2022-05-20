const Web3 = require('web3')
const Redis = require('ioredis')
const { toBN, fromWei } = require('web3-utils')

const { setSafeInterval } = require('./utils')
const { redisUrl, httpRpcUrl, privateKey, minimumBalance, netCurrencyName } = require('./config')

const web3 = new Web3(httpRpcUrl)
const redis = new Redis(redisUrl)

async function main() {
  try {
    if (!privateKey) {
      console.log('please set privateKey in your env, healthWatcher exiting......')
      process.exit(-1)
    }

    const { address } = web3.eth.accounts.privateKeyToAccount(privateKey)
    const balance = await web3.eth.getBalance(address)

    if (toBN(balance).lt(toBN(minimumBalance))) {
      throw new Error(`Not enough balance, less than ${fromWei(minimumBalance)} ${netCurrencyName}`)
    }

    await redis.hset('health', { status: true, error: '' })
  } catch (e) {
    console.error('healthWatcher', e.message)
    await redis.hset('health', { status: false, error: e.message })
  }
}

setSafeInterval(main, 30 * 1000)
