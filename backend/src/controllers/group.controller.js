const GroupService = require('../services/group.service')
const path = require('path')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class GroupController {
  constructor() {
    this.service = new GroupService()
  }

  async getGroups(req, res) {
    try {
      let courseId = req.params.id
      let groups = []
      if (req.role === 3) {
        if (req.params.question_id) {
          let questionId = req.params.question_id
          groups = await this.service.getGroupByQuestionId(courseId, questionId)
          return Response.OK(res, groups)
        }
        groups = await this.service.getAllGroups(courseId)
        return Response.OK(res, groups)
      }

      if (req.params.question_id) {
        let questionId = req.params.question_id
        groups = await this.service.getGroupByEmail(courseId, req.email, questionId)
      } else {
        groups = await this.service.getGroupByEmail(courseId, req.email)
      }

      return Response.OK(res, groups)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAssignResult(req, res) {
    try {
      let courseId = req.params.id
      let assigns = []
      let exerciseId = req.params.exercise_id
      assigns = await this.service.getAssignResult(courseId, exerciseId, req.email)

      return Response.OK(res, assigns)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getGroup(req, res) {
    try {
      let groupId = req.params.group_id
      let courseId = req.params.id
      let group = await this.service.getGroup(courseId, groupId)
      return Response.OK(res, group)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async create(req, res) {
    try {
      let courseId = req.params.id
      let group = await this.service.create(courseId, req.body, req.email)
      if (!group) return Response.ERROR(res, {}, Response.Message.E0000014)
      return Response.OK(res, group)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async update(req, res) {
    try {
      let groupId = req.params.group_id
      let courseId = req.params.id
      let group = await this.service.update(courseId, groupId, req.body)
      console.log(group)
      return Response.OK(res, group)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async assign(req, res) {
    try {
      let groupId = req.params.group_id
      let courseId = req.params.id
      let uploadFile = req.files.uploadfile
      let uploadFileName = req.files.uploadfile.name
      let now = Date.now()
      await uploadFile.mv(path.resolve(path.join(__dirname, `../../files/group/${now + '_' + uploadFileName}`)))
      let assign = await this.service.assign(courseId, groupId, path.resolve(path.join(__dirname, `../../files/group/${now + '_' + uploadFileName}`)))
      return Response.OK(res, assign)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async delete(req, res) {
    try {
      let groupId = req.params.group_id
      let courseId = req.params.id
      let result = await this.service.delete(courseId, groupId)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getUsers(req, res) {
    try {
      let groupId = req.params.group_id
      let courseId = req.params.id
      let users = await this.service.getUsersByGroup(courseId, groupId)
      return Response.OK(res, users)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

}

module.exports = GroupController
