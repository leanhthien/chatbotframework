var Recaptcha = require('recaptcha-verify')
const Response = require('../libs/response')
require('dotenv').config()

let requireCapcha = (req, res, next) => {
  if (process.env.ENABLE_CAPCHA == 'true') {
    if (req.body.captcha === undefined || req.body.captcha === '' || req.body.captcha === null) {
      return Response.ERROR(res, {}, Response.Message.E000008)
    }
    let recaptcha = new Recaptcha({
      secret: process.env.SECRETCAPCHA_SERVER,
      verbose: true
    })
    return recaptcha.checkResponse(req.body.captcha, function (error, response) {
      if (error) {
        console.log(error)
        return Response.ERROR(res, {}, Response.Message.F000004)
      }
      console.log(response)
      next()
    })
  }
  next()
}
module.exports = { RequireCapcha: requireCapcha }
