const PermissionService = require('../services/permission.service')
const moment = require('moment')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class PermissionController {
  constructor() {
    this.service = new PermissionService()
  }

  async create(req, res) {
    try {
      let data = req.body
      if (!data || !data.group_id || !data.tickeds || !data.unTicks) return Response.ERROR(res, {}, Response.Message.E0000019)
      data.tickeds.forEach(element => {
        if (!moment(element.start).isValid() || !moment(data.end).isValid()) return Response.ERROR(res, {}, Response.Message.E0000020)
      });
      let permission = await this.service.create(data)
      return Response.OK(res, permission)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getPermissions(req, res) {
    try {
      let groupId = req.params.group_id
      let permissions = await this.service.getPermissions(groupId)
      return Response.OK(res, permissions)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

}

module.exports = PermissionController
