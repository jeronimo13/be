const JobService = require('./JobService')
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

describe('JobService tests', () => {
  let client, contractor, unpaidJob, paidJob
  beforeAll(async () => {
    client = await Profile.create({
      id: 1,
      firstName: 'Harry',
      lastName: 'Potter',
      profession: 'Wizard',
      balance: 100,
      type: PROFILE_TYPE.CLIENT,
    })

    contractor = await Profile.create({
      id: 2,
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
    paidJob = await Job.create({
      description: 'work',
      price: 200,
      paid: true,
      paymentDate: '2020-08-15T19:11:26.737Z',
      ContractId: 1,
    })
  })

  describe('findUnpaid tests', () => {
    it('should return all unpaid jobs', async () => {
      expect.assertions(2)

      const unpaidJobsByClient = await JobService.findUnpaid({profile: client})
      const unpaidJobsByContractor = await JobService.findUnpaid({profile: contractor})
      expect(unpaidJobsByClient.length).toEqual(1)
      expect(unpaidJobsByContractor.length).toEqual(1)
    })
  })

  describe('getSumUnpaid tests', () => {
    it('should return sum of all unpaid jobs for the client', async () => {
      expect.assertions(2)

      const sumByClient = await JobService.getSumUnpaid({clientId: client.id})
      const sumByContractor = await JobService.getSumUnpaid({clientId: contractor.id})

      expect(sumByClient).toEqual(200)
      expect(sumByContractor).toEqual(0)
    })
  })

  describe('pay tests', () => {
    it('should throw an error: contractor cannot pay for a job', async () => {
      expect.assertions(1)

      try {
        await JobService.pay({jobId: 1, profile: contractor})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.WRONG_PROFILE_TYPE)
      }
    })

    it('should throw an error: cannot find unpaid job', async () => {
      expect.assertions(1)

      try {
        await JobService.pay({jobId: paidJob.id, profile: client})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.NOT_FOUND_JOB)
      }
    })

    it('should throw an error: insufficient balance', async () => {
      expect.assertions(1)

      try {
        await JobService.pay({jobId: unpaidJob.id, profile: client})
      } catch (err) {
        expect(err.message).toEqual(ERROR_MESSAGES.INSUFFICIENT_BALANCE)
      }
    })

    it('should pay for job', async () => {
      expect.assertions(3)
      // make client rich
      client.balance = 1000
      await client.save()

      await JobService.pay({jobId: unpaidJob.id, profile: client})

      client = await Profile.findByPk(client.id)
      expect(client.balance).toEqual(800)

      contractor = await Profile.findByPk(contractor.id)
      expect(contractor.balance).toEqual(1150 + 200)

      const job = await Job.findByPk(unpaidJob.id)
      expect(job.paid).toEqual(true)
    })
  })
})
