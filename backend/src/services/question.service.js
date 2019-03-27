const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
const moment = require('moment')
class QuestionService {
  async create(courseId, exerciseId, data) {
    try {
      let question = await Models.Question.create({
        name: data.name,
        order: data.order,
        sourcecode: data.sourcecode,
        sourcecode_name: data.sourcecode_name,
        testcase: data.testcase,
        testcase_name: data.testcase_name,
        solution: data.solution,
        solution_name: data.solution_name,
        description: data.description,
        num_submit: data.numSubmit,
        show_testcase: data.show_testcase,
        keyword: data.keywords
      })
      if (data.is_review === '1') {
        await Models.Question.update(
          {
            is_review: 1
          },
          { returning: true, where: { id: question.id } }
        )
      }
      let exercise = await Models.Exercise.findOne({ where: { id: exerciseId } })
      await question.setExercise(exercise)
      return question
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getQuestions(courseId, exerciseId) {
    try {
      let questions = await Models.Question.findAll({
        include: [{
          model: Models.Exercise,
          where: { id: exerciseId, is_delete: { [Op.ne]: 1 } }
        }],
        where: {
          is_delete: { [Op.ne]: 1 }
        }
      })
      return questions
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getQuestionsByGroup(courseId, exerciseId, email) {
    try {
      let user = await Models.User.findOne({
        where: { email: email, is_delete: { [Op.ne]: 1 } },
        include: {
          model: Models.Group,
          where: { is_delete: { [Op.ne]: 1 } },
          include: {
            model: Models.Question,
            where: { is_delete: { [Op.ne]: 1 } },
            include: { model: Models.Exercise, where: { id: exerciseId, is_delete: { [Op.ne]: 1 } } }
          }
        }
      })
      let groups = user.groups.filter(x => x.questions.length > 0)
      let questions = []
      if (groups.length <= 0) return []
      groups.forEach(group => {
        if (group.questions && group.questions.length > 0) {
          questions = questions.concat(group.questions)
        }
      })
      questions = questions.filter(question => {
        if (question.limit && question.limit && question.limit.start) {
          return moment().utc().isAfter(question.limit.start)
        } else {
          return true
        }
      })
      questions = questions.filter(question => {
        if (question.limit && question.limit && question.limit.is_delete !== 1) {
          return true
        } else {
          return false
        }
      })
      let questionIds = []
      questions.forEach(item => {
        questionIds.push(item.id)
      })
      let submissions = await Models.Submission.findAll({
        where: { questionId: questionIds, is_delete: { [Op.ne]: 1 } },
        include: [{ model: Models.User, where: { email: email } }]
      })
      let countSubmissions = {}
      submissions.forEach(item => {
        if (countSubmissions[item.questionId]) {
          countSubmissions[item.questionId] = parseInt(countSubmissions[item.questionId]) + 1
        } else {
          countSubmissions[item.questionId] = 1
        }
      })
      questions = questions.map(item => {
        let question = item
        question.dataValues.countSubmit = countSubmissions[item.id] || 0
        return question
      })
      return questions
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getQuestion(courseId, exerciseId, questionId) {
    try {
      let question = await Models.Question.findOne({ where: { id: questionId, is_delete: { [Op.ne]: 1 } } })
      return question
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async update(courseId, exerciseId, questionId, data) {
    try {
      let value = { ...data, order: 1 }
      return await Models.Question.update(
        value,
        { returning: true, where: { id: questionId } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
  async review(questionId, email) {
    try {
      let res = await Models.Question.update(
        {
          is_review: 1
        },
        { returning: true, where: { id: questionId } }
      )
      if (res) {
        let currentUser = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
        let submissions = await Models.Submission.update({ is_delete: 1 },
          { returning: true, where: { questionId: questionId, userId: currentUser.id } })
        return submissions
      }
      return null
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
  async delete(id) {
    try {
      let newQuestion = await Models.Question.update(
        {
          is_delete: 1
        },
        { returning: true, where: { id: id } }
      )
      if (newQuestion) {
        return true
      } else {
        return false
      }
    } catch (e) {
      Logger.error(e)
      return false
    }
  }
}
module.exports = QuestionService
