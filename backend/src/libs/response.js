const Message = require('./message')
module.exports = {
  OK: (res, data, msg = '', code = 200) => {
    return res.status(code).send({
      code: code,
      msg: msg,
      data: data
    })
  },

  ERROR: (res, data = {}, message) => {
    return res.status(message.code).send({
      code: message.code,
      msg: message.msg,
      data: data
    })
  },

  Message: Message
}
