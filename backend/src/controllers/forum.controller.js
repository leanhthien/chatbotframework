const ForumService = require('../services/forum.service')
const path = require('path')
const Logger = require('../libs/logger')
const Response = require('../libs/response')

class ForumController {
  constructor() {
      this.service = new ForumService()
  }

  //Issue
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
      let issue = await this.service.getIssues(req.email)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAllIssues(req, res) {
    try {
      let issues = await this.service.getAllIssues()
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

  async deleteIssue (req, res) {
    try {
      let issueId = req.params.id
      let result = await this.service.deleteIssue(issueId)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
  //End Issue

  //Reply
  async getReply(req, res) {
    try {
      let issueId = req.params.id
      let issue = await this.service.getReply(issueId)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getReplies(req, res) {
    try {
      let issue = await this.service.getReplies(req.email)
      return Response.OK(res, issue)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAllReplies(res) {
    try {
      let issues = await this.service.getAllReplies()
      return Response.OK(res, issues)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async createReply(req, res) {
    try {
      let issueId = req.params.id
      let reply = await this.service.createReply(issueId, req.body, req.email)
      return Response.OK(res, reply)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async deleteReply(req, res) {
    try {
      let replyId = req.params.id
      let result = await this.service.deleteReply(replyId)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
  //End Reply


  // Intent
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
      let intent = await this.service.getIntents()
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getAllIntents(req, res) {
    try {
      let intent = await this.service.getAllIntents()
      return Response.OK(res, intent)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getRecommendedIntents(req, res) {
    try {
      let intent = await this.service.getRecommendedIntents(req.body)
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

  async deleteIntent(req, res) {
    try {
      let intentId = req.params.id
      let result = await this.service.deleteIntent(intentId)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
  //End Intent

}

module.exports = ForumController