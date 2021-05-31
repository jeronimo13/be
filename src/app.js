const express = require('express')
require('express-async-errors')

const bodyParser = require('body-parser')
const {getProfile} = require('./middleware/getProfile')

const ContractService = require('./service/ContractService')
const JobService = require('./service/JobService')
const ClientService = require('./service/ClientService')

const {errorHandler} = require('./middleware/errorHandler')

const app = express()
app.use(bodyParser.json())

app.get('/contracts/:id', getProfile, async (req, res) => {
  const {id} = req.params
  res.json(await ContractService.findContractById({id, profile: req.profile}))
})

app.get('/contracts', getProfile, async (req, res) => {
  const contracts = await ContractService.findAll({profile: req.profile})
  res.json(contracts)
})

app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const jobs = await JobService.findUnpaid({profile: req.profile})
  res.json(jobs)
})

app.post('/jobs/:jobId/pay', getProfile, async (req, res) => {
  const client = req.profile
  const {jobId} = req.params
  await JobService.pay({jobId, client})
  res.sendStatus(200)
})

app.post('/balances/deposit/:id', async (req, res) => {
  const {id: clientId} = req.params
  const {amount} = req.body

  const client = await ClientService.deposit({clientId, amount})

  res.json(client)
})

app.get('/admin/best-profession', async (req, res) => {
  const yesterday = new Date()
  yesterday.setDate(new Date().getDate() - 1)

  const {start = yesterday, end = new Date()} = req.query
  const profession = await ClientService.findHighestPaidProfession({start, end})
  res.json(profession)
})

app.use(errorHandler)

module.exports = app
