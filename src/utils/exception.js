const FALLBACK_ERROR_MESSAGE = 'Something went wrong'

const ERROR_MESSAGES = {
  WRONG_PROFILE_TYPE: 'Contractor cannot pay for the job',
  NOT_FOUND_JOB: 'Job is not found',
  NOT_FOUND_CLIENT: 'Client is not found',
  NOT_FOUND_CONTRACTOR: 'Contractor is not found',
  NOT_FOUND_CONTRACT: 'Contract is not found',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  DEPOSIT_LIMIT: 'Cannot deposit more than 25% of unpaid jobs',
}

const ExceptionType = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  ERROR: 500,
}

class HttpException extends Error {
  constructor(status = 500, message = FALLBACK_ERROR_MESSAGE) {
    super(message)
    this.status = status
  }

  toJson() {
    return {status: this.status, message: this.message}
  }
}

class NotFoundException extends HttpException {
  constructor(message) {
    super(ExceptionType.NOT_FOUND, message || 'Object not found')
  }
}

class UnauthorizedException extends HttpException {
  constructor(message) {
    super(ExceptionType.UNAUTHORIZED, message || 'Unauthorized')
  }
}

class ForbiddenException extends HttpException {
  constructor(message) {
    super(ExceptionType.FORBIDDEN, message || 'Forbidden')
  }
}

class BadRequestException extends HttpException {
  constructor(message) {
    super(ExceptionType.BAD_REQUEST, message || 'Bad request')
  }
}

module.exports = {
  BadRequestException,
  NotFoundException,
  HttpException,
  ForbiddenException,
  UnauthorizedException,
  ERROR_MESSAGES,
}
