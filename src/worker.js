const Web3 = require('web3')
const { toBN, fromWei, toWei } = require('web3-utils')
const Redis = require('ioredis')

const tornadoABI = require('../abis/tornadoABI.json')
const { queue } = require('./queue')
const { getInstance, fromDecimals } = require('./utils')
const { jobType, status } = require('./constants')

const {
  netId,
  redisUrl,
  gasLimits,
  instances,
  privateKey,
  httpRpcUrl,
  baseFeeReserve,
  shieldingWithdrawFee,
  MAX_GAS_PRICE,
  CONFIRMATIONS,
} = require('./config')
const { TxManager } = require('tx-manager')

let web3
let currentTx
let currentJob
let txManager
const redis = new Redis(redisUrl)

function start() {
  try {
    web3 = new Web3(httpRpcUrl)
    if (!privateKey) {
      console.log('please set privateKey in your env, worker exiting......')
      process.exit(-1)
    }
    txManager = new TxManager({
      privateKey,
      rpcUrl: httpRpcUrl,
      config: {
        CONFIRMATIONS,
        MAX_GAS_PRICE,
        THROW_ON_REVERT: false,
        BASE_FEE_RESERVE_PERCENTAGE: baseFeeReserve,
      },
    })
    queue.process(processJob)
    console.log('Worker starte successfully!')
  } catch (e) {
    console.error('error on start worker', e.message)
  }
}

function checkFee({ data }) {
  if (data.type === jobType.SHIELDING_WITHDRAW) {
    return checkTornadoFee(data)
  }
}

async function getGasPrice() {
  const gasPrice = await redis.get('gasPrice')
  return toWei(gasPrice, 'gwei')
}

async function checkTornadoFee({ args, contract }) {
  const { currency, amount } = getInstance(contract)
  const { decimals } = instances[`netId${netId}`][currency]
  const [fee, refund] = [args[4], args[5]].map(toBN)
  const gasPrice = await getGasPrice()

  const ethPrice = await redis.hget('prices', currency)
  // gasLimits[jobType.SHIELDING_WITHDRAW] is the estimated value,
  // when send use gasLimits[WITHDRAW_WITH_EXTRA], we expect front's gas > gasLimits[jobType.SHIELDING_WITHDRAW],
  // and front's gas < gasLimits[WITHDRAW_WITH_EXTRA]
  const expense = toBN(gasPrice).mul(toBN(gasLimits[jobType.SHIELDING_WITHDRAW]))

  const feePercent = toBN(fromDecimals(amount, decimals))
    .mul(toBN(parseInt(shieldingWithdrawFee * 1e10)))
    .div(toBN(1e10 * 100))

  let desiredFee
  switch (currency) {
    case 'eth': {
      desiredFee = expense.add(feePercent)
      break
    }
    default: {
      desiredFee = expense
        .add(refund)
        .mul(toBN(10 ** decimals))
        .div(toBN(ethPrice))
      desiredFee = desiredFee.add(feePercent)
      break
    }
  }
  console.log(
    'sent fee, desired fee, feePercent',
    fromWei(fee.toString()),
    fromWei(desiredFee.toString()),
    fromWei(feePercent.toString()),
  )
  if (fee.lt(desiredFee)) {
    throw new Error('Provided fee is not enough. Probably it is a Gas Price spike, try to resubmit.')
  }
}

async function getTxObject({ data }) {
  if (data.type === jobType.SHIELDING_WITHDRAW) {
    // Now: without mining.
    let contract = new web3.eth.Contract(tornadoABI, data.contract)
    let calldata = contract.methods.withdraw(data.proof, ...data.args).encodeABI()
    let gasPrice = await getGasPrice()

    return {
      value: data.args[5],
      to: contract._address,
      data: calldata,
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: gasLimits['WITHDRAW_WITH_EXTRA'],
    }
  } else {
    throw new Error(`Unkown job type: ${data.type}`)
  }
}

async function processJob(job) {
  try {
    if (!jobType[job.data.type]) {
      throw new Error(`Unknown job type: ${job.data.type}`)
    }
    currentJob = job
    await updateStatus(status.ACCEPTED)
    console.log(`Start processing a new ${job.data.type} job #${job.id}`)
    await submitTx(job)
  } catch (e) {
    console.error('processJob', e.message)
    await updateStatus(status.FAILED)
    throw e
  }
}

async function submitTx(job) {
  await checkFee(job)
  currentTx = await txManager.createTx(await getTxObject(job))

  try {
    const receipt = await currentTx
      .send()
      .on('transactionHash', txHash => {
        updateTxHash(txHash)
        updateStatus(status.SENT)
      })
      .on('mined', receipt => {
        console.log('Mined in block', receipt.blockNumber)
        updateStatus(status.MINED)
      })
      .on('confirmations', updateConfirmations)

    if (receipt.status === 1) {
      await updateStatus(status.CONFIRMED)
    } else {
      throw new Error('Submitted transaction failed')
    }
  } catch (e) {
    throw new Error(`Revert by smart contract ${e.message}`)
  }
}

async function updateTxHash(txHash) {
  console.log(`A new successfully sent tx ${txHash}`)
  currentJob.data.txHash = txHash
  await currentJob.update(currentJob.data)
}

async function updateConfirmations(confirmations) {
  console.log(`Confirmations count ${confirmations}`)
  currentJob.data.confirmations = confirmations
  await currentJob.update(currentJob.data)
}

async function updateStatus(status) {
  console.log(`Job status updated ${status}`)
  currentJob.data.status = status
  await currentJob.update(currentJob.data)
}

start()
