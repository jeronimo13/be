const {buildWhereClause} = require('../utils/queryHelper')
const {ERROR_MESSAGES, NotFoundException} = require('../utils/exception')
const {Op} = require('sequelize')
const {Contract, CONTRACT_STATUS} = require('../model')

const ContractService = {}

/**
 * @returns contract by id
 */
ContractService.findContractById = async ({id, profile}) => {
  const contract = await Contract.findOne({
    where: {
      id,
      ...buildWhereClause(profile),
    },
  })
  if (!contract) {
    throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND_CONTRACT)
  }
  return contract
}

/**
 * @returns array of unterminated contracts. Could be empty.
 */
ContractService.findAll = async ({profile}) => {
  return Contract.findAll({
    where: {
      status: {[Op.ne]: CONTRACT_STATUS.TERMINATED},
      ...buildWhereClause(profile),
    },
  })
}

module.exports = ContractService
