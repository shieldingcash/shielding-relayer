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

  relayerAddress: process.env.RELAYER_ADDRESS || '0x9A68ff88988625bCAf138714772083E2C7EEE4d7',
  netExt: {
    netId199: {
      evm: true,
      verifier: '0x8bB82ACE9971C479FA0b65B534c2E59aaE9a19a9',
    },
    netId1029: {
      evm: true,
      verifier: '0x8bB82ACE9971C479FA0b65B534c2E59aaE9a19a9',
    },
  },
  // same as front's deployment.
  instances: {
    netId199: {
      // bttc main net
      btt: {
        instanceAddress: {
          1000: '0x793431607Ec6265fa309596b8629f9b30e3ACB07',
          100000000: '0xA34C619bEC89218cbb7dE9940190b3e3cD196d52',
          1000000000: '0x33804B6E0fA783b2d064F30748F36124c2027549',
        },
        // eth is the chian's raw token.
        symbol: 'BTT',
        decimals: 18,
        coinGeckoId: 'bittorrent',
      },
      //usdt: {
      //  instanceAddress: {},
      //  symbol: 'USDT',
      //  decimals: 6,
      //  coinGeckoId: 'tether',
      //},
    },
    netId1029: {
      // bttc test net
      btt: {
        instanceAddress: {
          10000: '0x8F78Eb4E18F18a166543d7E6648AFa99e80934D0',
          100000: '0x894162989237DcF463c108889f514Ef7a995dDF5',
          100000000: '0xA34C619bEC89218cbb7dE9940190b3e3cD196d52',
          1000000000: '0x33804B6E0fA783b2d064F30748F36124c2027549',
        },
        symbol: 'BTT',
        decimals: 18,
        coinGeckoId: 'bittorrent',
      },
      //usdt: {
      //  instanceAddress: {
      //    1000: '0x99Bc3aee04aa83e32a6F77B4a9ed5939D6956344',
      //    10000: '0x7A88cC3d2a356E4c47bA857c7bD76202BdcBAAe9',
      //    100000: '0x74Ea7aC50C29d1314Ef2D22A09F126867cb9B696',
      //    1000000: '0xA6025Aeb8989b77B7cb993eA31257C8165E797A3',
      //  },
      //  symbol: 'USDT',
      //  decimals: 6,
      //  coinGeckoId: 'tether',
      //},
    },
  },
}
