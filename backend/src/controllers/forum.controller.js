const ForumService = require('../services/forum.service')
const path = require('path')
const Logger = require('../libs/logger')
const Response = require('../libs/response')

class ForumController {
  constructor() {
      this.service = new ForumService()
  }

  async getIssue(req, res) {
    try {
      let issueId = req.params.id
      let issue = await this.service.getIssue(issueId)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getIssues(req, res) {
    try {
      let issue = await this.service.getIssues(req.body, req.email)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAllIssues(req, res) {
    try {
      let issues = await this.service.getAllIssues(req.email)
      return Response.OK(res, issues)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async createIssue(req, res) {
    try {
      let issue = await this.service.createIssue(req.body, req.email)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async replyIssue(req, res) {
    try {
      let issueId = req.params.id
      let issue = await this.service.replyIssue(issueId, req.body)
      return Response.OK(res, issue)
      } catch (e) {
        Logger.error(e)
        return Response.ERROR(res, {}, Response.Message.F000001)
      }
  }

  async getIntent(req, res) {
    try {
      let intentId = req.params.id
      let intent = await this.service.getIntent(intentId)
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getIntents(req, res) {
    try {
      let intent = await this.service.getIntents(req.body, req.email)
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAllIntents(req, res) {
    try {
      let intent = await this.service.getAllIntents(req.email)
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async createIntent(req, res) {
    try {
      let intent = await this.service.createIntent(req.body, req.email)
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async updateIntent(req, res) {
    try {
      let intentId = req.params.id
      let intent = await this.service.updateIntent(intentId, req.body)
      return Response.OK(res, intent)
      } catch (e) {
        Logger.error(e)
        return Response.ERROR(res, {}, Response.Message.F000001)
      }
  }

}

module.exports = ForumController