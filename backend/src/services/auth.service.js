const Logger = require('../libs/logger')
const Models = require('../models/index')
const bcrypt = require('bcrypt')
var nodemailer = require('nodemailer')
const Op = Models.Sequelize.Op

class AuthService {
  async getUser (username) {
    try {
      return await Models.User.findOne({ where: { username: username, is_delete: { [Op.ne]: 1 } } })
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getUserByEmail (email) {
    try {
      return await Models.User.findOne({ where: { email: email.toLowerCase(), is_delete: { [Op.ne]: 1 } } })
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  transporterSendMail (mailOptions) {
    var transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'autograding123@gmail.com', // Your email id
        pass: 'lab609H6' // Your password
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      }
    })
    // var errorSend = ""
    return new Promise(function (resolve, reject) {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          return reject({ success: false, msg: 'Send mail error' })
        } else {
          return resolve({ success: true, msg: 'Please, check mail to verify' })
        }
      })
    })
  }

  async sendEmail (toEmail, link) {
    var mailOptions = {
      from: 'autograding123@gmail.com',
      to: toEmail,
      subject: 'Please confirm your Email account',
      text: 'Hello ' + toEmail + '✔',
      html: 'Hello,<br> Please Click on the link to verify your email.<br><a href=' + link + `>Click here to verify</a>
          <br>
          <h2> Auto-grading </h2>`,
      bcc: 'autograding123@gmail.com'
    }
    try {
      return await this.transporterSendMail(mailOptions)
    } catch (error) {
      Logger.error(error)
      return null
    }
  }

  async reSendEmail (toEmail, newpw, sub) {
    var mailOptions = {
      from: 'autograding123@gmail.com',
      to: toEmail,
      subject: sub,
      text: 'Hello ' + toEmail + '✔',
      html: 'Hello,<br> Here is  your new password .<br><p> password: ' + newpw + `<p>
          <br>
          <h2> Auto-grading </h2>`,
      bcc: 'autograding123@gmail.com'
    }

    try {
      return await this.transporterSendMail(mailOptions)
    } catch (error) {
      Logger.error(error)
      return null
    }
  }

  async updateResetPassword (username, newrand, newpw) {
    try {
      const salt = bcrypt.genSaltSync()
      let encryptPassword = bcrypt.hashSync(newpw, salt)
      return await Models.User.update(
        {
          number_rand: newrand,
          password: encryptPassword
        },
        { returning: true, where: { username: username } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  validateEmail (email) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(String(email).toLowerCase())
  }

  async createUser (data) {
    try {
      let user = await Models.User.create({
        username: data.username,
        fullname: data.fullname,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role,
        active: 1
      })
      return { user: user, error: '' }
    } catch (e) {
      Logger.error(e)
      if (e.name && e.name === 'SequelizeUniqueConstraintError') {
        return { user: null, error: 'User already exists' }
      } else {
        return { user: null, error: 'Something went wrong' }
      }
    }
  }

  async update (email, data) {
    try {
      return await Models.User.update(
        {
          number_rand: data
        },
        { returning: true, where: { email: email.toLowerCase() } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async verifyEmail (username, rand) {
    try {
      let user = await Models.User.findOne({ where: { username: username } })
      if (user) {
        console.log('random', user.number_rand, rand)
        if (parseInt(user.number_rand) === parseInt(rand)) {
          return { success: true, msg: '' }
        }
        return { success: false, msg: 'number-rand mismatch' }
      } else {
        return { success: false, msg: 'user not exist' }
      }
    } catch (e) {
      Logger.error(e)
      return { success: false, msg: 'Something went wrong' }
    }
  }

  async changePassword (newpassword, email) {
    try {
      const salt = bcrypt.genSaltSync()
      let encryptPassword = bcrypt.hashSync(newpassword, salt)
      return await Models.User.update(
        {
          password: encryptPassword
        },
        { returning: true, where: { email: email.toLowerCase() } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
}
module.exports = AuthService
