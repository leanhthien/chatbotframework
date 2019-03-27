const AssigneeService = require('../services/assignee.service')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class AssigneeController {
  constructor () {
    this.service = new AssigneeService()
  }

  async create (req, res) {
    try {
      let result = await this.service.create(req.body)
      if (!result) return Response.ERROR(res, {}, Response.Message.E0000012)
      else {
        return Response.OK(res, result, `Assigned course to TA !`)
      }
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getEmails (req, res) {
    try {
      let courseId = req.params.id
      let result = await this.service.getEmails(courseId)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      else {
        return Response.OK(res, result)
      }
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}
module.exports = AssigneeController
