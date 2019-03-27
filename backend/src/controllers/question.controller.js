const QuestionService = require('../services/question.service')
const Logger = require('../libs/logger')
const fs = require('fs').promises
const path = require('path')
const Response = require('../libs/response')
const unzipper = require('unzipper')
class QuestionController {
  constructor() {
    this.service = new QuestionService()
  }
  async getQuestions(req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let questions = []
      if (req.role === 1) {
        questions = await this.service.getQuestionsByGroup(courseId, exerciseId, req.email)
      } else {
        questions = await this.service.getQuestions(courseId, exerciseId)
      }

      for (let element of questions) {
        if (element.sourcecode) {
          element.sourcecode = element.sourcecode.toString('utf8')
        }
        if (element.description) {
          element.description = element.description.toString('utf8')
        }
      }
      return Response.OK(res, questions)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getQuestionsForStudent(req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let questions = []
      if (req.role === 1) {
        questions = await this.service.getQuestionsByGroup(courseId, exerciseId, req.email)
      }
      for (let element of questions) {
        if (element.sourcecode) {
          element.sourcecode = element.sourcecode.toString('utf8')
        }
        delete element.dataValues.solution_name
        delete element.dataValues.solution
        delete element.dataValues.testcase_name
        delete element.dataValues.testcase
        if (element.description) {
          element.description = element.description.toString('utf8')
        }
      }
      return Response.OK(res, questions)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async getQuestion(req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let questionId = req.params.question_id
      let question = await this.service.getQuestion(courseId, exerciseId, questionId)
      if (question.sourcecode) {
        question.sourcecode = question.sourcecode.toString('utf8')
      }
      if (question.description) {
        question.description = question.description.toString('utf8')
      }
      return Response.OK(res, question)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async create(req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let solutionUploadFile = req.files.solution
      let solutionFileName = req.files.solution.name
      let testcaseUploadFile = req.files.testcase
      let testcaseFileName = req.files.testcase.name
      let sourcecodeUploadFile = req.files.sourcecode
      let sourcecodeFileName = req.files.sourcecode.name
      let description = req.body.description
      let name = req.body.name
      let keywords = req.body.keywords
      let numSubmit = req.body.num_submit
      let arrayTestcase = ''
      const directory = await unzipper.Open.buffer(testcaseUploadFile.data)
      for (let x = 0; x < directory.files.length; x++) {
        const content = await directory.files[x].buffer()
        arrayTestcase += `${content.toString()};`
      }
      await sourcecodeUploadFile.mv(path.resolve(path.join(__dirname, `../../files/sourcecode/${sourcecodeFileName}`)))
      let sourcecode = await fs.readFile(path.resolve(path.join(__dirname, `../../files/sourcecode/${sourcecodeFileName}`)))
      await solutionUploadFile.mv(path.resolve(path.join(__dirname, `../../files/solution/${solutionFileName}`)))
      let solution = await fs.readFile(path.resolve(path.join(__dirname, `../../files/solution/${solutionFileName}`)))
      await testcaseUploadFile.mv(path.resolve(path.join(__dirname, `../../files/testcase/${testcaseFileName}`)))
      let testcase = await fs.readFile(path.resolve(path.join(__dirname, `../../files/testcase/${testcaseFileName}`)))
      console.log(req.body.is_review)
      let data = {
        sourcecode: sourcecode,
        sourcecode_name: sourcecodeFileName,
        solution: solution,
        solution_name: solutionFileName,
        testcase: testcase,
        testcase_name: testcaseFileName,
        description: description,
        numSubmit: numSubmit,
        name: name,
        keywords: keywords,
        show_testcase: arrayTestcase,
        is_review: req.body.is_review || null
      }
      let question = await this.service.create(courseId, exerciseId, data)
      if (!question) return Response.ERROR(res, {}, Response.Message.E0000015)
      return Response.OK(res, question)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async review(req, res) {
    try {
      // update question to reviewed
      // delete sumission by questionId
      let questionId = req.params.question_id
      let result = await this.service.review(questionId, req.email)
      if (result) {
        return Response.OK(res, result)
      }
      return Response.ERROR(res, {}, Response.Message.F000006)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async update(req, res) {
    try {
      let courseId = req.params.id
      let exerciseId = req.params.exercise_id
      let questionId = req.params.question_id
      let data = {}
      if (req.files) {
        let solutionUploadFile = req.files.solution
        if (solutionUploadFile) {
          let solutionFileName = req.files.solution.name
          await solutionUploadFile.mv(path.resolve(path.join(__dirname, `../../files/solution/${solutionFileName}`)))
          let solution = await fs.readFile(path.resolve(path.join(__dirname, `../../files/solution/${solutionFileName}`)))
          data['solution_name'] = solutionFileName
          data['solution'] = solution
        }
        let testcaseUploadFile = req.files.testcase
        if (testcaseUploadFile) {
          let testcaseFileName = req.files.testcase.name
          await testcaseUploadFile.mv(path.resolve(path.join(__dirname, `../../files/testcase/${testcaseFileName}`)))
          let testcase = await fs.readFile(path.resolve(path.join(__dirname, `../../files/testcase/${testcaseFileName}`)))
          let arrayTestcase = ''
          const directory = await unzipper.Open.buffer(testcase)
          for (let x = 0; x < directory.files.length; x++) {
            const content = await directory.files[x].buffer()
            arrayTestcase += `${content.toString()};`
          }
          data['show_testcase'] = arrayTestcase
          data['testcase_name'] = testcaseFileName
          data['testcase'] = testcase
        }
        let sourcecodeUploadFile = req.files.sourcecode
        if (sourcecodeUploadFile) {
          let sourcecodeFileName = req.files.sourcecode.name
          await sourcecodeUploadFile.mv(path.resolve(path.join(__dirname, `../../files/sourcecode/${sourcecodeFileName}`)))
          let sourcecode = await fs.readFile(path.resolve(path.join(__dirname, `../../files/sourcecode/${sourcecodeFileName}`)))
          data['sourcecode_name'] = sourcecodeFileName
          data['sourcecode'] = sourcecode
        }
      }
      let description = req.body.description
      if (description) {
        data['description'] = description
      }
      let numSubmit = req.body.num_submit
      if (numSubmit) {
        data['num_submit'] = numSubmit
      }
      let name = req.body.name
      if (name) {
        data['name'] = name
      }
      let keywords = req.body.keywords
      if (keywords) {
        data['keyword'] = keywords
      }
      let question = await this.service.update(courseId, exerciseId, questionId, data)
      return Response.OK(res, question)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }

  async delete(req, res) {
    try {
      let questionId = req.params.question_id
      // let exercise_id = req.params.exercise_id
      // let courseId = req.params.id
      let result = await this.service.delete(questionId)
      return Response.OK(res, result)
    } catch (e) {
      Logger.error(e)
      return Response.ERROR(res, {}, Response.Message.F000001)
    }
  }
}

module.exports = QuestionController
