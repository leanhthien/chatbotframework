const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class ForumService {

  //Issue
  async getIssue(issueId) {
    try {
      let issue = await Models.Issue.findOne({ 
        include: [{
          model: Models.Reply,
          as: "replies" 
        }], 
        where: { id: issueId, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIssuesByEmail(email) {
    try {
      let issue = await Models.Issue.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return issue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIssues() {
    try {
      let issues = await Models.Issue.findAll({ 
        where: { is_delete: { [Op.ne]: 1 } } })
      return issues
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createIssue(data, email) {
    try {
      let user = await Models.User.findOne({ where: { email: email } })
      let newIssue = await Models.Issue.create({
        username: user.username,
        question: data.question
      })
      return newIssue
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
//End issue

//Reply
  async getReply(replyId) {
    try {
      let reply = await Models.Reply.findOne({ where: { id: replyId, is_delete: { [Op.ne]: 1 }} })
      return reply
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getRepliesByIssue(issueId) {
    try {

      let replies = await Models.Reply.findAll({ where: { email: email, is_delete: { [Op.ne]: 1 }} })
      return replies
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllReplies() {
    try {
      let replies = await Models.Reply.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return replies
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async createReply(issueId, data, email) {
    try {
      let issue  = await Models.Issue.findOne({ where: { id: issueId } })
      let user = await Models.User.findOne({ where: { email: email } })
      let newReply = await Models.Reply.create({
        username: user.username,
        answer: data.answer
      })
      newReply.setIssue(issue)
      return newReply
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
//End Reply

//Intent
  async getIntent(intentId) {
    try {
      let intent = await Models.Intent.findOne({ where: { id: intentId, is_delete: { [Op.ne]: 1 }} })
      return intent
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getIntents() {
    try {
      let intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return intents
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllIntents() {
    try {
      let intents = await Models.Intent.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return intents
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
//End Intent
  

}

module.exports = ForumService