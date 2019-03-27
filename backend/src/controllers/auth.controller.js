
const jwt = require('jsonwebtoken')
var Recaptcha = require('recaptcha-verify')
const AuthService = require('../services/auth.service')
const bcrypt = require('bcrypt')
const Logger = require('../libs/logger')
const randomstring = require('randomstring')
const Response = require('../libs/response')
require('dotenv').config()
class AuthController {
  constructor () {
    this.authService = new AuthService()
  }

  async login (req, res) {
    if (req.rateLimit && req.rateLimit.limit < req.rateLimit.current) {
      return Response.ERROR(res, {}, Response.Message.F000007)
    }
    try {
      let user = await this.authService.getUserByEmail(req.body.email, req.body.password)
      if (!user) {
        return Response.ERROR(res, {}, Response.Message.E000001)
      }
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      if (!passwordIsValid) {
        return Response.ERROR(res, {}, Response.Message.E000002)
      }
      let token = jwt.sign({ email: user.email, role: user.role }, process.env.SECRET, {
        expiresIn: 14400 // expires in 24 hours
      })
      return Response.OK(res, { fullname: user.fullname, email: user.email, role: user.role, token: token })
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async register (req, res) {
    try {
      let userData = req.body
      userData.role = 1
      if (!userData.username) {
        return Response.ERROR(res, {}, Response.Message.E000003)
      }
      if (!userData.fullname) {
        return Response.ERROR(res, {}, Response.Message.E000004)
      }
      if (!userData.email) {
        return Response.ERROR(res, {}, Response.Message.E000005)
      }
      if (!userData.password) {
        return Response.ERROR(res, {}, Response.Message.E000009)
      }
      if (!this.authService.validateEmail(userData.email)) {
        return Response.ERROR(res, {}, Response.Message.E000006)
      }

      let returnData = await this.authService.createUser(userData)

      if (!returnData.user) return Response.ERROR(res, {}, Response.Message.E000007)
      return Response.OK(res, returnData.user)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async registerTa (req, res) {
    try {
      let userData = req.body

      const newPw = randomstring.generate({
        length: 12,
        charset: 'alphanumeric'
      })

      userData.password = newPw
      let returnData = await this.authService.createUser(userData)
      if (!returnData.user) return Response.ERROR(res, {}, Response.Message.E000007)
      else {

        let resSendEmail = await this.authService.reSendEmail(userData.email, newPw, 'New password')
        if (resSendEmail.success) {
          return Response.OK(res, {}, `Sent password to email address!`)
        }
        Response.ERROR(res, {}, Response.Message.E0000021)

        // check mail to get password
      }
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
  checkToken (req, res) {
    var token = req.headers.authorization
    if (req.rateLimit && req.rateLimit.limit < req.rateLimit.current) {
      res.status(200).send({ auth: false, message: 'Too many request from this IP, please try again after few minutes' })
    }
    if (!token) { return res.status(401).send({ auth: false, message: 'No token provided.' }) }
    jwt.verify(token.replace('Bearer ', ''), process.env.SECRET, function (err, decoded) {
      if (err) {
        Logger.error(err)
        return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
      }
      res.status(200).send({ auth: true, decoded: decoded })
    })
  }

  async resetPassword (req, res) {
    try {
      let user = await this.authService.getUserByEmail(req.body.email)
      if (!user) {
        return Response.ERROR(res, {}, Response.Message.E000001)
      } else {
        let rand = Math.floor((Math.random() * 100000) + (Math.random() * 10000) + (Math.random() * 1000) + (Math.random() * 100))
        let result = await this.authService.update(req.body.email, rand)
        if (result && parseInt(result[0]) === 1) {
          let link = `http://${req.get('host')}/api/verify/${user.username}?rand=${rand}`
          let resSendEmail = await this.authService.sendEmail(req.body.email, link)
          if (resSendEmail && resSendEmail.success) {
            return Response.OK(res, { success: true, msg: resSendEmail.msg })
          }
          return Response.ERROR(res, {}, Response.Message.E000003)
        }
        return Response.ERROR(res, {}, Response.Message.F000001)
      }
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async verifyEmail (req, res) {
    try {
      let result = await this.authService.verifyEmail(req.params.id, req.query.rand)
      if (result.success) {
        let newrand = Math.floor((Math.random() * 100000) + (Math.random() * 10000) + (Math.random() * 1000) + (Math.random() * 100))
        const newPw = randomstring.generate({
          length: 12,
          charset: 'alphanumeric'
        })
        var result1 = await this.authService.updateResetPassword(req.params.id, newrand, newPw)
        if (result1) {
          var resSendEmail = await this.authService.reSendEmail(result1[1][0].dataValues.email, newPw, 'Reset password')
          if (resSendEmail && resSendEmail.success) {
            res.end('<h1>Email is been Successfully verified, Check mail to get password</h1>')
          }
          res.end('<h1>Error when send mail</h1>')
        } else {
          res.end('<h1>Somethong went wrong, please try again</h1>')
        }
      } else {
        res.end('<h1>Error when send verify email</h1>')
      }
    } catch (e) {
      Logger.error(e)
      return res.status(500).send('Error on the server.')
    }
  }
  async changePassword (req, res) {
    try {
      let user = await this.authService.getUserByEmail(req.email)
      if (!user) return Response.ERROR(res, {}, Response.Message.E000001)
      let passwordIsValid = bcrypt.compareSync(req.body.password, user.password)
      if (!passwordIsValid) { return Response.ERROR(res, {}, Response.Message.E0000010) }
      let result = await this.authService.changePassword(req.body.newpassword, req.email)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}
module.exports = AuthController
