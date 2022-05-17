require('dotenv').config()

const { jobType } = require('./constants')
module.exports = {
  netId: Number(process.env.NET_ID) || 1029,
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  httpRpcUrl: process.env.HTTP_RPC_URL || 'https://pre-rpc.bt.io',
  privateKey: process.env.PRIVATE_KEY,
  port: process.env.APP_PORT || 8053,

  shieldingWithdrawFee: Number(process.env.REGULAR_SHIELDING_WITHDRAW_FEE) || Number('0.05'),
  gasLimits: {
    [jobType.SHIELDING_WITHDRAW]: 390000,
    WITHDRAW_WITH_EXTRA: 700000,
    [jobType.MINING_REWARD]: 455000,
    [jobType.MINING_WITHDRAW]: 400000,
  },
  minimumBalance: '1000000000000000000',
  netCurrencyName: process.env.NET_CURRENCY_NAME || 'BTT',
  baseFeeReserve: Number(process.env.BASE_FEE_RESERVE_PERCENTAGE) || 25,

  instances: {
    relayerAddress: process.env.RELAYER_ADDRESS || '0xf574f119978412A41b0e47dDD750C12A1f08Af3C',
    netId199: {
      tokens: {
        eth: {
          // eth is the chian's raw token.
          symbol: 'BTT',
          decimals: 18,
          cmcId: 16086,
        },
        usdt: {
          symbol: 'USDT',
          decimals: 6,
          cmcId: 825,
        },
      },
      evm: true,
    },
    netId1029: {
      tokens: {
        eth: {
          symbol: 'BTT',
          decimals: 18,
          cmcId: 16086,
        },
        usdt: {
          symbol: 'USDT',
          decimals: 6,
          cmcId: 825,
        },
      },
      evm: true,
    },
  },
}
