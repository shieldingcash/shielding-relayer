const Web3 = require('web3')
const Redis = require('ioredis')
const axios = require('axios')
// const { toBN } = require('web3-utils')

const { setSafeInterval } = require('./utils')
const { netId, instances, redisUrl, httpRpcUrl } = require('./config')

const web3 = new Web3(httpRpcUrl)
const redis = new Redis(redisUrl)
const cmcUrl = 'https://pro-api.coinmarketcap.com/v2/tools/price-conversion'
const cmcApiKeys = ['541df26c-f866-4bdf-88c3-e14a033cb570']

async function fetchPrices() {
  let netTokens = instances[`netId${netId}`].tokens
  let keys = Object.keys(netTokens)

  let prices = new Map()
  for (let i = 0; i < keys.length; ++i) {
    try {
      let id = netTokens[keys[i]].cmcId
      let url = `${cmcUrl}?id=${id}&amount=1&convert=USD`
      let response = await axios.get(url, {
        headers: {
          'X-CMC_PRO_API_KEY': cmcApiKeys[i % cmcApiKeys.length],
        },
      })
      prices.set(keys[i], response.data.data.quote['USD'].price)
    } catch (e) {
      console.log('cmc error=', e.message)
      return
    }
  }
  // console.log(prices)
  if (prices.has('eth')) {
    let eth_decimals = netTokens['eth'].decimals
    for (let i = 0; i < keys.length; ++i) {
      let decimals = netTokens[keys[i]].decimals

      let price_in_eth = (prices.get(keys[i]) * 10 ** eth_decimals) / (prices.get('eth') * 10 ** decimals)
      await redis.hset('prices', keys[i], price_in_eth)
      console.log(`hset < prices, ${keys[i]} ${price_in_eth} >`)
    }
  }
}

function web3FetchGasPrice() {
  try {
    web3.eth.getGasPrice().then(async gasPrice => {
      if (gasPrice) {
        await redis.set('gasPrice', gasPrice)
        console.log(`set gasPrice ${gasPrice}`)
      }
    })
  } catch (e) {
    console.log('error=', e.message)
  }
}

async function main() {
  let isEvm = instances[`netId${netId}`].evm
  if (isEvm) {
    web3FetchGasPrice()
  }
  await fetchPrices()
}

// 10 minute update
setSafeInterval(main, 10 * 60 * 1000)
