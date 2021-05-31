const {UnauthorizedException} = require('../utils/exception')
const ClientService = require('../service/ClientService')

const getProfile = async (req, res, next) => {
  const clientId = req.get('profile_id') || 0
  const profile = await ClientService.findProfileById({clientId})
  if (!profile) {
    throw new UnauthorizedException()
  }
  req.profile = profile
  next()
}

module.exports = {getProfile}
