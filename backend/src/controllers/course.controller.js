const CourseService = require('../services/course.service')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class CourseController {
  constructor () {
    this.service = new CourseService()
  }

  async getCourses (req, res) {
    try {
      if (req.role === 3) {
        let courses = await this.service.getAllCourses()
        return Response.OK(res, { courses: courses })
      }
      let courses = await this.service.getCourseByEmail(req.email)
      // return Response.ERROR(res, {}, Response.Message.F000001)
      return Response.OK(res, { courses: courses })
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getCourse (req, res) {
    try {
      let courseId = req.params.id
      let course = await this.service.getCourse(courseId)
      return Response.OK(res, { course: course })
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async create (req, res) {
    try {
      let course = await this.service.create(req.body)
      if (!course) return Response.ERROR(res, {}, Response.Message.E0000011)
      return Response.OK(res, { course: course })
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async update (req, res) {
    try {
      let courseId = req.params.id
      let course = await this.service.update(courseId, req.body)
      if (!course) return Response.ERROR(res, {}, Response.Message.E0000011)
      return Response.OK(res, { course: course })
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async delete (req, res) {
    try {
      let courseId = req.params.id
      let result = await this.service.delete(courseId)
      if (!result) return Response.ERROR(res, {}, Response.Message.F000006)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}

module.exports = CourseController
