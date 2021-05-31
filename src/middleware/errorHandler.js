const {HttpException} = require('../utils/exception')

/**
 * express-async-errors allows to handle custom exception in async handlers without calling "next"
 */
const errorHandler = function (err, req, res, next) {
  if (err instanceof HttpException) {
    if (err.status === 500) {
      console.error(err.message)
    }
    res.status(err.status).send(err.message)
  } else {
    next(err)
  }
}

module.exports = {errorHandler}
