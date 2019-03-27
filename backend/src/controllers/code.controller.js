const CodeService = require('../services/code.service')
const fs = require('fs')
const path = require('path')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class CodeController {
  constructor () {
    this.service = new CodeService()
  }
  async submitCode (req, res) {
    try {
      let data = req.body
      let userEmail = req.email
      let questionId = data.question_id
      const role = req.role
      let now = Date.now()
      let filename = `${userEmail}_${questionId}_${now}.cpp`
      data.name = filename
      data.mimetype = 'text/plain'
      await fs.writeFileSync(path.resolve(path.join(__dirname, `../../files/submit/${filename}`)), data.code)
      data.data = await fs.readFileSync(path.resolve(path.join(__dirname, `../../files/submit/${filename}`)))
      let response = await this.service.submitCode(data, userEmail, role)
      console.log(response)
      if (!response || !response.success) {
        if (response.code === 416) return Response.ERROR(res, {}, Response.Message.E0000016)
        else if (response.code === 417) return Response.ERROR(res, {}, Response.Message.E0000017)
        else if (response.code === 418) return Response.ERROR(res, {}, Response.Message.E0000018)
        else if (response.code === 500) return Response.ERROR(res, {}, Response.Message.F000001)
        return Response.ERROR(res, {}, Response.Message.F000006)
      }
      return Response.OK(res, response.data)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}

module.exports = CodeController
