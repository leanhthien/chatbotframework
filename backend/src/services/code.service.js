const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
const moment = require('moment')
class CodeService {
  async submitCode (data, userEmail, role) {
    try {
      let user = {}
      let question = {}
      let countSubmissions
      if (role === 2 || role === 3) {
        user = await Models.User.findOne({ where: { email: userEmail, is_delete: { [Op.ne]: 1 } } })
        question = await Models.Question.findOne({ where: { is_delete: { [Op.ne]: 1 }, id: data.question_id } })
      } else {
        user = await Models.User.findOne({ where: { email: userEmail, is_delete: { [Op.ne]: 1 } },
          include: { model: Models.Group,
            where: { is_delete: { [Op.ne]: 1 } },
            include: { model: Models.Question,
              where: { id: data.question_id } } } })
        let group = user.groups.find(x => x.questions.length > 0 && x.questions.find(y => y.id === data.question_id))
        question = group.questions.find(x => x.id === data.question_id)
        if (question && question.limit && question.limit.start && question.limit.end &&
          moment(question.limit.start).isValid() &&
          moment(question.limit.end).isValid()) {
          if (moment().utc().isBefore(question.limit.start)) {
            return { success: false, data: null, code: 416 }
          }
          if (moment().utc().isAfter(question.limit.end)) {
            return { success: false, data: null, code: 417 }
          }
        }
        countSubmissions = await Models.Submission.count({
          where: { questionId: data.question_id, is_delete: { [Op.ne]: 1 } },
          include: { model: Models.User, where: { email: userEmail, is_delete: { [Op.ne]: 1 } } }
        })
        if (question.num_submit && (countSubmissions >= question.num_submit)) {
          return { success: false, data: null, code: 418 }
        }
      }
      let newSubmission = await Models.Submission.create({
        data: data.data,
        mimetype: data.mimetype,
        name: data.name,
        num_success: 0,
        num_testcase: 0,
        log: '',
        note: '',
        status: 0,
        questionId: data.question_id
      })
      await newSubmission.setUser(user)
      if (role !== 2 && role !== 3) {
        newSubmission.dataValues.countSubmissions = parseInt(countSubmissions) + 1
      }
      return { success: true, data: newSubmission, code: 200 }
    } catch (e) {
      Logger.error(e)
      return { success: false, data: null, code: 500 }
    }
  }
}
module.exports = CodeService
