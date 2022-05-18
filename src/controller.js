const {
  getShieldingWithdrawInputError,
  getMiningRewardInputError,
  getMiningWithdrawInputError,
} = require('./validator')

const { postJob } = require('./queue')
const { jobType } = require('./constants')
const { netId, netExt, httpRpcUrl } = require('./config')
const verifierABI = require('../abis/verifierABI.json')
const tornadoABI = require('../abis/tornadoABI.json')

const Web3 = require('web3')
const web3 = new Web3(httpRpcUrl)

async function checkEvmNet(verifierAddress, req) {
  let tornado = new web3.eth.Contract(tornadoABI, req.body.contract)
  const isValidRoot = await tornado.methods.isKnownRoot(web3.utils.toHex(req.body.args[0])).call()
  if (!isValidRoot) {
    throw new Error('EC=2: Merkle tree is corrupted')
  }
  const isSpent = await tornado.methods.isSpent(web3.utils.toHex(req.body.args[1])).call()
  if (isSpent) {
    throw new Error('EC=3: The note is already spent')
  }
  let verifier = new web3.eth.Contract(verifierABI, verifierAddress)
  let v_success = await verifier.methods.verifyProof(req.body.proof, req.body.args).call()
  if (!v_success) {
    throw new Error('EC=4: verifyProof failed')
  }
}

async function shieldingWithdraw(req, res) {
  const inputError = getShieldingWithdrawInputError(req.body)
  if (inputError) {
    console.log('EC=1, Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  console.log('server accept request=', req.body)
  try {
    const isEvm = netExt[`netId${netId}`].evm
    const verifierAddress = netExt[`netId${netId}`].verifier
    if (isEvm) {
      await checkEvmNet(verifierAddress, req)
    }
  } catch (e) {
    console.log('check error:', e.message)
    return res.status(400).json({ error: e.message })
  }

  const id = await postJob({
    type: jobType.SHIELDING_WITHDRAW,
    request: req.body,
  })
  return res.json({ id })
}

async function miningReward(req, res) {
  const inputError = getMiningRewardInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.MINING_REWARD,
    request: req.body,
  })
  return res.json({ id })
}

async function miningWithdraw(req, res) {
  const inputError = getMiningWithdrawInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.MINING_WITHDRAW,
    request: req.body,
  })
  return res.json({ id })
}

module.exports = {
  shieldingWithdraw,
  miningReward,
  miningWithdraw,
}
