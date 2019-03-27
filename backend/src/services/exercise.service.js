const Logger = require('../libs/logger')
const Models = require('../models/index')
const moment = require('moment')
const Op = Models.Sequelize.Op
class ExerciseService {
  async getExercises (courseId) {
    try {
      let exercises = await Models.Exercise.findAll({ include: [{
        model: Models.Course,
        where: { id: courseId, is_delete: { [Op.ne]: 1 } }
      }],
      where: { is_delete: { [Op.ne]: 1 } } })
      return exercises
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getExercisesAndStatus (courseId, email) {
    try {
      // get exercises
      let exercises = await Models.Exercise.findAll({ include: [{
        model: Models.Course,
        where: { id: courseId, is_delete: { [Op.ne]: 1 } }
      }],
      where: { is_delete: { [Op.ne]: 1 } } })
      if (!exercises || exercises.length === 0) return []
      // array id of exercise for query question
      let exerciseIds = []
      exercises.forEach(item => {
        exerciseIds.push(item.id)
      })
      // let questions buy group of user
      let user = await Models.User.findOne({
        where: { email: email, is_delete: { [Op.ne]: 1 } },
        include: { model: Models.Group,
          where: { is_delete: { [Op.ne]: 1 } },
          include: { model: Models.Question,
            where: { is_delete: { [Op.ne]: 1 } },
            include: { model: Models.Exercise, where: { id: exerciseIds, is_delete: { [Op.ne]: 1 } } } } } })
      let groups = user.groups.filter(x => x.questions.length > 0)
      // get question of ggroup
      if (groups.length <= 0) return exercises
      let questions = []
      groups.forEach(group => {
        if (group.questions && group.questions.length > 0) {
          questions = questions.concat(group.questions)
        }
      })
      let questionIds = []
      questions.forEach(item => {
        questionIds.push(item.id)
      })
      // let submission of question
      let submission = await Models.Submission.findAll({
        where: { questionId: questionIds, is_delete: { [Op.ne]: 1 } },
        include: {
          model: Models.User,
          where: { email: email, is_delete: { [Op.ne]: 1 } }
        }
      })
      let questionInfo = {}
      submission.forEach(item => {
        // lấý lần nộp có điểm coa nhất của câu hỏi đó
        if (!questionInfo[item.questionId] || questionInfo[item.questionId].num_success < item.num_success) {
          questionInfo[item.questionId] = item
        }
      })
      let exerciseInfor = {}
      questions.forEach(item => {
        item.dataValues.submissions = questionInfo[item.id]
        if (exerciseInfor[item.exerciseId]) {
          exerciseInfor[item.exerciseId].data.push(item)
        } else {
          exerciseInfor[item.exerciseId] = {
            countSubmited: 0,
            data: [item],
            countGraded: 0
          }
        }
        if (questionInfo[item.id]) {
          exerciseInfor[item.exerciseId].countSubmited = exerciseInfor[item.exerciseId].countSubmited + 1
          if (questionInfo[item.id].status === 2) {
            exerciseInfor[item.exerciseId].countGraded = exerciseInfor[item.exerciseId].countGraded + 1
          }
        }
      })
      exercises = exercises.map(item => {
        if (exerciseInfor[item.id]) {
          item.dataValues.questions = exerciseInfor[item.id].data
          item.dataValues.number_questions = exerciseInfor[item.id].data.length
          item.dataValues.countSubmited = exerciseInfor[item.id].countSubmited
          item.dataValues.countGraded = exerciseInfor[item.id].countGraded
        } else {
          item.dataValues.questions = []
          item.dataValues.number_questions = 0
          item.dataValues.countSubmited = 0
          item.dataValues.countGraded = 0
        }
        return item
      })
      return exercises
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getExercise (courseId, exerciseId) {
    try {
      let exercise = await Models.Exercise.findOne({ where: { id: exerciseId, is_delete: { [Op.ne]: 1 } } })
      return exercise
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async create (courseId, data) {
    try {
      let course = await Models.Course.findOne({ where: { id: courseId } })
      let newExercise = await Models.Exercise.create({
        code: data.code,
        name: data.name,
        description: data.description
      })
      await newExercise.setCourse(course)
      return newExercise
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async update (courseId, exerciseId, data) {
    try {
      return await Models.Exercise.update(
        {
          code: data.code,
          name: data.name,
          description: data.description
        },
        { returning: true, where: { id: exerciseId } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async delete (courseId, exerciseId) {
    try {
      let newExercise = await Models.Exercise.update({
        is_delete: 1
      }, { returning: true, where: { id: exerciseId } })
      if (newExercise) {
        return true
      }
      return false
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

  async getTopResults (courseId, groupId, exerciseId, email) {
    try {
      let questions = []
      // admin
      if (!email) {
        let groups = await Models.Group.findOne({ where: { id: groupId, is_delete: { [Op.ne]: 1 } },
          include: { model: Models.Question,
            include: { model: Models.Exercise, where: { id: exerciseId, is_delete: { [Op.ne]: 1 } } }
          }
        })
        questions = groups.questions
      } else { // TA
        let user = await Models.User.findOne({
          where: { email: email, is_delete: { [Op.ne]: 1 } },
          include: { model: Models.Group,
            where: { id: groupId, is_delete: { [Op.ne]: 1 } },
            include: { model: Models.Question,
              where: { is_delete: { [Op.ne]: 1 } },
              include: { model: Models.Exercise, where: { id: exerciseId, is_delete: { [Op.ne]: 1 } } }
            }
          }
        })
        let groups = user.groups.filter(x => x.questions.length > 0)
        if (groups.length <= 0) return []
        groups.forEach(group => {
          if (group.questions && group.questions.length > 0) {
            questions = questions.concat(group.questions)
          }
        })
      }
      if (!questions || questions.length <= 0) return null
      let questionIds = []
      let objectQuestion = {}
      questions.forEach(item => {
        if (item.id) {
          questionIds.push(item.id)
          objectQuestion[item.id] = item
        }
      })
      let submission = await Models.Submission.findAll({
        where: { questionId: questionIds, is_delete: { [Op.ne]: 1 } },
        include: [{
          model: Models.User,
          where: { is_delete: { [Op.ne]: 1 } },
          include: [{
            model: Models.Group,
            where: { id: groupId, is_delete: { [Op.ne]: 1 } }
          }]
        }]
      })
      // Sort
      if (submission.length === 0) {
        return []
      }
      submission = submission.sort((a, b) => {
        if (a.userId > b.userId) {
          return 1
        }
        if ((a.userId === b.userId) && (
          (a.questionId > b.questionId) ||
          (a.questionId === b.questionId && a.num_success > b.num_success)
        )) {
          return 1
        }
        return -1
      })
      // get max
      let result = []
      let object = submission[0]
      submission.forEach((item, index) => {
        if (object.userId === item.userId && object.questionId === item.questionId) {
          if (object.num_success <= item.num_success) {
            object = item
          }
        } else {
          object.dataValues.questionInfo = objectQuestion[object.questionId]
          result.push(object)
          object = item
        }
        if (index === submission.length - 1) {
          object.dataValues.questionInfo = objectQuestion[object.questionId]
          result.push(object)
        }
      })
      return result
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getResultsByEmail (userEmail, exerciseId) {
    try {
      let questions = await Models.Question.findAll({ include: [{
        model: Models.Exercise,
        where: { id: exerciseId, is_delete: { [Op.ne]: 1 } }
      }],
      where: {
        is_delete: { [Op.ne]: 1 }
      } })
      if (!questions || questions.length <= 0) return null
      let questionIds = []
      questions.forEach(item => {
        if (item.id) {
          questionIds.push(item.id)
        }
      })
      let submission = await Models.Submission.findAll({
        where: { questionId: questionIds, is_delete: { [Op.ne]: 1 } },
        include: [{ model: Models.User, where: { email: userEmail } }]
      })
      submission = submission.map(item => {
        if (item.createdAt) {
          item.dataValues.createdAt = moment(item.createdAt).utc()
        }
        return item
      })
      return submission
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
}
module.exports = ExerciseService
