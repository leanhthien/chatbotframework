const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class CourseService {
  async getCourseByEmail (email) {
    try {
      let course = await Models.Course.findAll({ include: [{
        model: Models.User,
        where: { email: email, is_delete: { [Op.ne]: 1 } }
      }],
      where: { is_delete: { [Op.ne]: 1 } } })
      return course
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAllCourses () {
    try {
      let allCourses = await Models.Course.findAll({ where: { is_delete: { [Op.ne]: 1 } } })
      return allCourses
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getCourse (courseId) {
    try {
      let course = await Models.Course.findOne({ where: { id: courseId, is_delete: { [Op.ne]: 1 } } })
      return course
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async create (data) {
    try {
      return await Models.Course.create({
        code: data.code,
        name: data.name,
        description: data.description
      })
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async update (id, data) {
    try {
      return await Models.Course.update(
        {
          code: data.code,
          name: data.name,
          description: data.description
        },
        { returning: true, where: { id: id } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async delete (id) {
    try {
      let newCourse = await Models.Course.update(
        {
          is_delete: 1
        },
        { returning: true, where: { id: id } }
      )
      if (newCourse) { return true } else { return false }
    } catch (e) {
      Logger.error(e)
      return false
    }
  }
}
module.exports = CourseService
