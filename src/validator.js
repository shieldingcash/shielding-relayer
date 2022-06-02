const { isAddress, toChecksumAddress } = require('web3-utils')
const { getInstance } = require('./utils')
const { relayerAddress } = require('./config')

const Ajv = require('ajv')
const ajv = new Ajv({ format: 'fast' })

ajv.addKeyword('isAddress', {
  validate: (schema, data) => {
    try {
      return isAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isKnownContract', {
  validate: (schema, data) => {
    try {
      return getInstance(data) !== null
    } catch (e) {
      return false
    }
  },
  errors: true,
})

ajv.addKeyword('isFeeRecipient', {
  validate: (schema, data) => {
    try {
      return toChecksumAddress(relayerAddress) === toChecksumAddress(data)
    } catch (e) {
      return false
    }
  },
  errors: true,
})

const addressType = { type: 'string', pattern: '^0x[a-fA-F0-9]{40}$', isAddress: true }
const proofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{512}$' }
const bytes32Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }
const instanceType = { ...addressType, isKnownContract: true }
const relayerType = { ...addressType, isFeeRecipient: true }

const shieldingWithdrawSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    contract: instanceType,
    args: {
      type: 'array',
      maxItems: 6,
      minItems: 6,
      items: [bytes32Type, bytes32Type, addressType, relayerType, bytes32Type, bytes32Type],
    },
  },
  additionalProperties: false,
  required: ['proof', 'contract', 'args'],
}

const validateShieldingWithdraw = ajv.compile(shieldingWithdrawSchema)

function getInputError(validator, data) {
  validator(data)
  if (validator.errors) {
    const error = validator.errors[0]
    return `${error.dataPath} ${error.message}`
  }
  return null
}

function getShieldingWithdrawInputError(data) {
  return getInputError(validateShieldingWithdraw, data)
}

module.exports = {
  getShieldingWithdrawInputError,
}
