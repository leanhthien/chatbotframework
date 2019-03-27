const ExerciseService = require('../services/exercise.service')
const Logger = require('../libs/logger')
const Response = require('../libs/response')
class ExerciseController {
  constructor () {
    this.service = new ExerciseService()
  }

  async getExercises (req, res) {
    try {
      let courseId = req.params.id
      let exercises = []
      if (req.role === 1) {
        exercises = await this.service.getExercisesAndStatus(courseId, req.email)
      } else {
        exercises = await this.service.getExercises(courseId)
      }
      return Response.OK(res, exercises)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getExercise (req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let exercise = await this.service.getExercise(courseId, exerciseId)
      return Response.OK(res, exercise)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async create (req, res) {
    try {
      let courseId = req.params.id
      let course = await this.service.create(courseId, req.body)
      if (!course) return Response.ERROR(res, {}, Response.Message.E0000013)
      return Response.OK(res, course)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async update (req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let exercise = await this.service.update(courseId, exerciseId, req.body)
      if (!exercise) return Response.ERROR(res, {}, Response.Message.E0000013)
      return Response.OK(res, exercise)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async delete (req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let result = await this.service.delete(courseId, exerciseId)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getResults (req, res) {
    try {
      // let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let results = []
      results = await this.service.getResultsByEmail(req.email, exerciseId)
      return Response.OK(res, results)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getResultsByGroup (req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let groupId = req.params.group_id
      let results = []
      if (req.role === 2) {
        results = await this.service.getTopResults(courseId, groupId, exerciseId, req.email)
      }
      if (req.role === 3) {
        results = await this.service.getTopResults(courseId, groupId, exerciseId, null)
      }
      return Response.OK(res, results)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}

module.exports = ExerciseController
