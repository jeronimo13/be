const ClientService = require('./ClientService')
const {ERROR_MESSAGES} = require('../utils/exception')
const {Profile, Contract, Job, sequelize, PROFILE_TYPE, CONTRACT_STATUS} = require('../model')

beforeAll(async () => {
  await Profile.sync({force: true})
  await Contract.sync({force: true})
  await Job.sync({force: true})
})

afterAll(async () => {
  await sequelize.sync({force: true})
})

describe('ClientService tests', () => {
  describe('findProfileById tests', () => {
    it('should resolve to null', async () => {
      await expect(ClientService.findProfileById({clientId: 1})).resolves.toBe(null)
    })

    it('should resolve to a profile', async () => {
      await Profile.create({
        id: 1,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: 'client',
      })

      const exist = await ClientService.findProfileById({clientId: 1})
      expect(exist.firstName).toEqual('Harry')
    })
  })

  describe('getProfileById tests', () => {
    it('should throw an error', async () => {
      expect.assertions(1)
      try {
        await ClientService.getProfileById({clientId: 123456})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.NOT_FOUND_CLIENT)
      }
    })
  })

  describe('deposit tests', () => {
    let client, contractor, unpaidJob
    beforeAll(async () => {
      client = await Profile.create({
        id: 10,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 100,
        type: PROFILE_TYPE.CLIENT,
      })

      contractor = await Profile.create({
        id: 20,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: PROFILE_TYPE.CONTRACTOR,
      })

      await Contract.create({
        id: 1,
        terms: 'bla bla bla',
        status: CONTRACT_STATUS.IN_PROGRESS,
        ClientId: client.id,
        ContractorId: contractor.id,
      })

      unpaidJob = await Job.create({
        description: 'work',
        price: 200,
        ContractId: 1,
      })
    })
    it('should throw an error: Client not found', async () => {
      expect.assertions(1)
      try {
        await ClientService.deposit({clientId: 123456, amount: 1000})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.NOT_FOUND_CLIENT)
      }
    })

    it('should throw an error: Cannot deposit more than 25% of unpaid jobs', async () => {
      expect.assertions(1)
      try {
        await ClientService.deposit({clientId: client.id, amount: unpaidJob.price * 2})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.DEPOSIT_LIMIT)
      }
    })

    it('should deposit money', async () => {
      const clientBalance = client.balance
      await ClientService.deposit({clientId: client.id, amount: unpaidJob.price})

      client = await Profile.findByPk(client.id)
      expect(client.balance).toEqual(clientBalance + unpaidJob.price)
    })
  })

  describe('findHighestPaidProfession tests', () => {
    it('should return highest profession', () => {})
    it('should return empty string for a given range', () => {})
  })
})
