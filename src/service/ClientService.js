const {NotFoundException, ERROR_MESSAGES, ForbiddenException, HttpException} = require('../utils/exception')
const {Profile, sequelize} = require('../model')

const JobService = require('./JobService')

const ClientService = {}

/**
 * returns profile or null
 * @param clientId
 * @returns {Promise<Profile | null>}
 */
ClientService.findProfileById = async ({clientId}) => {
  return Profile.findByPk(clientId)
}

/**
 * returns profile or throws NotFoundException
 * @param clientId
 * @returns {Promise<Profile>}
 */
ClientService.getProfileById = async ({clientId}) => {
  const client = await ClientService.findProfileById({clientId})
  if (!client) {
    throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND_CLIENT)
  }
  return client
}

/**
 * Deposit money on the client's account.
 */
ClientService.deposit = async ({clientId, amount}) => {
  const client = await ClientService.getProfileById({clientId})
  const jobsToPay = await JobService.getSumUnpaid({clientId})

  if (1.25 * jobsToPay < amount) {
    throw new ForbiddenException(ERROR_MESSAGES.DEPOSIT_LIMIT)
  }

  try {
    await sequelize.transaction(async (transaction) => {
      client.balance += amount
      await client.save({transaction})
    })
  } catch (error) {
    throw new HttpException()
  }
  return client
}

/**
 * Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
 */
ClientService.findHighestPaidProfession = async ({start, end}) => {
  const [result] = await sequelize.query(
    `select sum(price) as sum, profession
from Jobs
         join Contracts C on C.id = Jobs.ContractId
         join Profiles P on C.ContractorId = P.id
where Jobs.paid is 1
  and Jobs.updatedAt >= datetime(:start)
  and Jobs.updatedAt <= datetime(:end)
group by profession
order by sum DESC
limit 1`,
    {
      replacements: {start, end},
    }
  )
  return result.length > 0 ? result[0].profession : ''
}

module.exports = ClientService
