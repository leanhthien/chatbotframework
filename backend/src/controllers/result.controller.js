const ResultService = require('../services/result.service')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class ResultController {
  constructor () {
    this.service = new ResultService()
  }

  async getResults (req, res) {
    try {
      let results = await this.service.getResults(req.email)
      return Response.OK(res, results)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}
module.exports = ResultController
