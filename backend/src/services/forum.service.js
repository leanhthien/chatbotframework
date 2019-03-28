const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class ForumService {

  async getIssue(data, email) {
    try {
      let issue = await Models.Issue.findOne({ where: { email: email, question: data.question } })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIssues(email) {
    try {
      let issues = await Models.Issue.findAll({ where: { email: email } })
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

  async replyIssue(data, email) {
    try {
      return await Models.Issue.update(
        {
          answer: data.answer
        },
        { returning: true, where: { email: email, question: data.question } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntent(data, email) {
    try {
      let intent = await Models.Intent.findOne({ where: { email: email, question: data.question } })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIntents(email) {
    try {
      let intent = await Models.Intent.findAll({ where: { email: email } })
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

  

}

module.exports = ForumService