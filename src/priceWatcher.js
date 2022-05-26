const Web3 = require('web3')
const Redis = require('ioredis')
const axios = require('axios')
// const { toBN } = require('web3-utils')

const { setSafeInterval } = require('./utils')
const { netId, instances, netExt, redisUrl, httpRpcUrl } = require('./config')

const web3 = new Web3(httpRpcUrl)
const redis = new Redis(redisUrl)
const cmcUrl = 'https://pro-api.coinmarketcap.com/v2/tools/price-conversion'
const cmcApiKeys = ['541df26c-f866-4bdf-88c3-e14a033cb570']
var keyPos = 0,
  timeInterval = 10

async function fetchPrices() {
  let netTokens = instances[`netId${netId}`]
  let keys = Object.keys(netTokens)

  let prices = new Map()
  for (let i = 0; i < keys.length; ++i) {
    try {
      let id = netTokens[keys[i]].cmcId
      let url = `${cmcUrl}?id=${id}&amount=1&convert=USD`
      let response = await axios.get(url, {
        headers: {
          'X-CMC_PRO_API_KEY': cmcApiKeys[keyPos++ % cmcApiKeys.length],
        },
      })
      prices.set(keys[i], response.data.data.quote['USD'].price)
    } catch (e) {
      console.error('priceWatcher[1]', e.message)
      return
    }
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

// 10 minute update
console.log(`timeInterval=${timeInterval} minute`)
setSafeInterval(main, timeInterval * 60 * 1000)
