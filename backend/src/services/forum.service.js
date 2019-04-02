const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class ForumService {

  async getIssue(issueId) {
    try {
      let issue = await Models.Issue.findOne({ where: { id: issueId, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIssues(data, email) {
    try {
      let issue = await Models.Issue.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIssues(email) {
    try {
      let issues = await Models.Issue.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
      return issues
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createIssue(data, email) {
    try {
      let newIssue = await Models.Issue.create({
        email: email,
        question: data.question,
        answer: ''
      })
      return newIssue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async replyIssue(issueId, data) {
    try {
      return await Models.Issue.update(
        {
          answer: data.answer
        },
        { returning: true, where: { id: issueId } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntent(intentId) {
    try {
      let intent = await Models.Intent.findOne({ where: { id: intentId, is_delete: { [Op.ne]: 1 }} })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntents(data, email) {
    try {
      let intent = await Models.Intent.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIntents(email) {
    try {
      let intent = await Models.Intent.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createIntent(data, email) {
    try {
      let newIntent = await Models.Intent.create({
        email: email,
        question: data.question,
        answer: data.answer
      })
      return newIntent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async updateIntent(intentId, data) {
    try {
      return await Models.Intent.update(
        {
          question: data.question,
          answer: data.answer
        },
        { returning: true, where: { id: intentId } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  

}

module.exports = ForumService