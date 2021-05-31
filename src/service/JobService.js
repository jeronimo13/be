const {ForbiddenException, ERROR_MESSAGES, HttpException, NotFoundException} = require('../utils/exception')
const {PROFILE_TYPE, Profile} = require('../model')
const {buildWhereClause} = require('../utils/queryHelper')
const {Op} = require('sequelize')
const {Job, Contract, CONTRACT_STATUS, sequelize} = require('../model')

const JobService = {}

/**
 * @returns a list of unpaid jobs of contracts with status in_progress
 */
JobService.findUnpaid = async ({profile}) => {
  return Job.findAll({
    where: {
      paid: {
        [Op.not]: true,
      },
    },
    include: {
      model: Contract,
      attributes: [],
      where: {
        status: CONTRACT_STATUS.IN_PROGRESS,
        ...buildWhereClause(profile),
      },
    },
  })
}

JobService.getSumUnpaid = async ({clientId}) => {
  const [{sum}] = await Job.findAll({
    attributes: [[sequelize.fn('SUM', sequelize.col('price')), 'sum']],
    where: {
      paid: {
        [Op.not]: true,
      },
      '$Contract.ClientId$': clientId,
    },
    include: {
      model: Contract,
      attributes: [],
    },
    raw: true,
  })
  return sum || 0
}

/**
 * Pay for a job. Job must be not paid, authenticated user must be a client and the client's balance must be more than job's price
 */
JobService.pay = async ({jobId, client}) => {
  if (client.type !== PROFILE_TYPE.CLIENT) {
    throw new ForbiddenException(ERROR_MESSAGES.WRONG_PROFILE_TYPE)
  }
  const job = await Job.findOne({
    where: {
      id: jobId,
      paid: {
        [Op.not]: true,
      },
      '$Contract.Client.id$': client.id,
    },
    include: {
      model: Contract,
      include: [
        {
          model: Profile,
          as: 'Contractor',
        },
        {
          model: Profile,
          as: 'Client',
          attributes: [],
        },
      ],
    },
  })
  if (!job) {
    throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND_JOB)
  }
  const contractor = job.Contract.Contractor
  if (!contractor) {
    throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND_CONTRACTOR)
  }
  if (job.price > client.balance) {
    throw new ForbiddenException(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
  }

  try {
    await sequelize.transaction(async (transaction) => {
      job.paid = true
      await job.save({transaction})
      contractor.balance += job.price
      await contractor.save({transaction})
      client.balance -= job.price
      await client.save({transaction})
    })
  } catch (error) {
    throw new HttpException()
  }
}

module.exports = JobService
