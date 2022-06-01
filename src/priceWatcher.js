const Web3 = require('web3')
const Redis = require('ioredis')
const axios = require('axios')
// const { toBN } = require('web3-utils')

const { setSafeInterval } = require('./utils')
const { netId, instances, netExt, redisUrl, httpRpcUrl } = require('./config')

const web3 = new Web3(httpRpcUrl)
const redis = new Redis(redisUrl)
const coinUrl = 'https://api.coingecko.com/api/v3/simple/price'
var timeInterval = 2

async function fetchPrices() {
  let netTokens = instances[`netId${netId}`]
  let keys = Object.keys(netTokens)

  let prices = new Map()
  let ids = ''
  for (let i = 0; i < keys.length; ++i) {
    let id = netTokens[keys[i]].coinGeckoId
    if (i > 0) ids += ','
    ids += id
  }
  try {
    let url = `${coinUrl}?ids=${ids}&vs_currencies=usd`

    let response = await axios.get(url)
    for (let i = 0; i < keys.length; ++i) {
      let id = netTokens[keys[i]].coinGeckoId
      let price = response.data[id].usd
      prices.set(keys[i], price)
    }
  } catch (e) {
    console.error('priceWatcher[1]', e.message)
    return
  }

  // console.log(prices)
  if (prices.has('btt')) {
    let eth_decimals = netTokens['btt'].decimals
    for (let i = 0; i < keys.length; ++i) {
      let decimals = netTokens[keys[i]].decimals

      let price_in_eth = (prices.get(keys[i]) * 10 ** eth_decimals) / (prices.get('btt') * 10 ** decimals)
      try {
        await redis.hset('prices', keys[i], price_in_eth)
        console.log(`hset < prices, ${keys[i]} ${price_in_eth} >`)
      } catch (e) {
        console.error('priceWatcher[2]', e.message)
      }
    }
  }
}

function web3FetchGasPrice() {
  try {
    web3.eth.getGasPrice().then(async gasPrice => {
      if (gasPrice) {
        try {
          gasPrice = await web3.utils.fromWei(gasPrice, 'gwei')
          await redis.set('gasPrice', gasPrice)
          console.log(`set gasPrice ${gasPrice}`)
        } catch (e) {
          console.error('priceWatcher[3]', e.message)
        }
      }
    })
  } catch (e) {
    console.error('priceWatcher[4]', e.message)
  }
}

async function main() {
  let isEvm = netExt[`netId${netId}`].evm
  if (isEvm) {
    web3FetchGasPrice()
  }
  await fetchPrices()
}

console.log(`timeInterval=${timeInterval} seconds`)
setSafeInterval(main, timeInterval * 1000)
