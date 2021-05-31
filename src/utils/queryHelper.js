const {PROFILE_TYPE} = require('../model')

const buildWhereClause = (profile) => {
  let where = {}
  if (profile.type === PROFILE_TYPE.CONTRACTOR) {
    where['contractorId'] = profile.id
  } else {
    where['clientId'] = profile.id
  }
  return where
}

module.exports = {buildWhereClause}
