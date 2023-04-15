export class ApiError extends Error {
  constructor(message, stack = '') {
    super(message)
    this.message = JSON.stringify(message)
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
