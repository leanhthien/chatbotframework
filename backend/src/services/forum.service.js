const Logger = require('../libs/logger')
const Models = require('../models/index')
const CsvtojsonV2 = require('csvtojson')

class ForumService {

  async createIssue(data, email) {
    try {
      let newIssue = await Models.Issue.create({
        email: email,
        question: data.question
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

  async getIssue(data, email) {
    try {
      let issue = await Models.Issue.findOne({ where: { email: email, question: data.question, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIssues(email) {
    try {
      let issues = await Models.Issue.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return issues
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
        anwer: data.answer
      })
      return newIntent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntent(email) {
    try {
      let intent = await Models.Issue.find({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

}

module.exports = ForumService