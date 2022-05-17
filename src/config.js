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
  CONFIRMATIONS: process.env.CONFIRMATIONS || 4,
  MAX_GAS_PRICE: process.env.MAX_GAS_PRICE || 1e6,

  relayerAddress: process.env.RELAYER_ADDRESS || '0xf574f119978412A41b0e47dDD750C12A1f08Af3C',
  isEvmNet: {
    netId199: true,
    netId1029: true,
  },

  // same as front's deployment.
  instances: {
    netId199: {
      // bttc main net
      eth: {
        instanceAddress: {},
        // eth is the chian's raw token.
        symbol: 'BTT',
        decimals: 18,
        cmcId: 16086,
      },
      usdt: {
        instanceAddress: {},
        symbol: 'USDT',
        decimals: 6,
        cmcId: 825,
      },
    },
    netId1029: {
      // bttc test net
      eth: {
        instanceAddress: {
          10000: '0xCEaF988d9fcD53a459428e675C6551E08910D8E0',
          100000: '0xE34b8A0A028fd0108295e4aD8b2789fBf1A95b06',
          1000000: '0xa4b92ed00AfDec0D6E09634f67E3249D1C4e35AC',
          10000000: '0x1C01160E4E57873FF273FCf1aa70BaEF01571F0D',
        },
        symbol: 'BTT',
        decimals: 18,
        cmcId: 16086,
      },
      usdt: {
        instanceAddress: {
          1000: '0x99Bc3aee04aa83e32a6F77B4a9ed5939D6956344',
          10000: '0x7A88cC3d2a356E4c47bA857c7bD76202BdcBAAe9',
          100000: '0x74Ea7aC50C29d1314Ef2D22A09F126867cb9B696',
          1000000: '0xA6025Aeb8989b77B7cb993eA31257C8165E797A3',
        },
        symbol: 'USDT',
        decimals: 6,
        cmcId: 825,
      },
    },
  },
}
