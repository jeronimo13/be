const ContractService = require('./ContractService')
const {Profile, Contract, Job, sequelize, PROFILE_TYPE, CONTRACT_STATUS} = require('../model')
const {ERROR_MESSAGES} = require('../utils/exception')

beforeAll(async () => {
  await Profile.sync({force: true})
  await Contract.sync({force: true})
  await Job.sync({force: true})
})

afterAll(async () => {
  await sequelize.sync({force: true})
})

describe('Contract Service tests', () => {
  describe('findContractById tests', () => {
    it('should throw notFoundException', async () => {
      expect.assertions(1)
      const profile = await Profile.create({
        id: 1,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: PROFILE_TYPE.CLIENT,
      })

      try {
        await ContractService.findContractById({id: 12345, profile})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.NOT_FOUND_CONTRACT)
      }
    })

    it('should find a contract', async () => {
      expect.assertions(2)

      const client = await Profile.create({
        id: 2,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: PROFILE_TYPE.CLIENT,
      })

      const contractor = await Profile.create({
        id: 3,
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

      const contractByClient = await ContractService.findContractById({id: 1, profile: client})
      const contractByContractor = await ContractService.findContractById({id: 1, profile: contractor})
      expect(contractByClient.status).toEqual(CONTRACT_STATUS.IN_PROGRESS)
      expect(contractByContractor.status).toEqual(CONTRACT_STATUS.IN_PROGRESS)
    })
  })

  describe('findAll', () => {
    it('should find all unterminated contracts', async () => {
      expect.assertions(2)

      const client = await Profile.create({
        id: 10,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: PROFILE_TYPE.CLIENT,
      })

      const contractor = await Profile.create({
        id: 30,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: PROFILE_TYPE.CONTRACTOR,
      })
      await Contract.create({
        id: 10,
        terms: 'bla bla bla',
        status: CONTRACT_STATUS.IN_PROGRESS,
        ClientId: client.id,
        ContractorId: contractor.id,
      })

      await Contract.create({
        id: 11,
        terms: 'bla bla bla',
        status: CONTRACT_STATUS.TERMINATED,
        ClientId: client.id,
        ContractorId: contractor.id,
      })

      const allContractByClient = await ContractService.findAll({profile: client})
      const allContractByContractor = await ContractService.findAll({profile: contractor})
      expect(allContractByClient.length).toEqual(1)
      expect(allContractByContractor.length).toEqual(1)
    })
  })
})
