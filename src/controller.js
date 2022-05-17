const {
  getShieldingWithdrawInputError,
  getMiningRewardInputError,
  getMiningWithdrawInputError,
} = require('./validator')

const { postJob } = require('./queue')
const { jobType } = require('./constants')

async function shieldingWithdraw(req, res) {
  const inputError = getShieldingWithdrawInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }
  // TODO: check duplicated operations and verify it first you can doit.

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
