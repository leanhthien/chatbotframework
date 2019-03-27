const Log4js = require('log4js')
Log4js.configure({
  appenders: {
    file: { type: 'file', filename: './logs/error.log' },
    console: { type: 'console' }
  },
  categories: { default: { appenders: [ 'console', 'file' ], level: 'info' } }
})
let logger = Log4js.getLogger()
module.exports = logger
