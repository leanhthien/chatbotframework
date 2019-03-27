const Logger = require('../libs/logger')
const Models = require('../models/index')
const moment = require('moment')
const Op = Models.Sequelize.Op
class ResultService {
  async getResults (email) {
    try {
      let submissions = await Models.Submission.findAll({ include: [{
        model: Models.User,
        where: { email: email, is_delete: { [Op.ne]: 1 } }
      }] })
      if (!submissions) return []
      let questionIds = []
      submissions.forEach(item => {
        if (item.questionId) {
          questionIds.push(item.questionId)
        }
      })
      let questions = await Models.Question.findAll({
        where: { id: questionIds, is_delete: { [Op.ne]: 1 } },
        include: {
          model: Models.Exercise,
          where: { is_delete: { [Op.ne]: 1 } },
          include: {
            model: Models.Course,
            where: { is_delete: { [Op.ne]: 1 } }
          }
        }
      })
      let infoQuestions = {}
      questions.forEach(item => {
        infoQuestions[item.id] = item
      })
      submissions = submissions.map(item => {
        item.dataValues.question = infoQuestions[item.questionId]
        if (item.createdAt) {
          item.dataValues.createdAt = moment(item.createdAt).utc()
        }
        return item
      })
      submissions = submissions.filter(item => item.dataValues.question)
      return submissions
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
}
module.exports = ResultService
