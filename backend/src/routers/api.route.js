const api = require('express').Router()
const AuthController = require('../controllers/auth.controller')
const CourseController = require('../controllers/course.controller')
const ExerciseController = require('../controllers/exercise.controller')
const QuestionController = require('../controllers/question.controller')
const { RequireLogin } = require('../middlewares/authen.middleware')
const { RequireCapcha } = require('../middlewares/capcha.middleware')
const CodeController = require('../controllers/code.controller')
const { RequirePermision } = require('../middlewares/author.middleware')
const AssigneeController = require('../controllers/assignee.controller')
const GroupController = require('../controllers/group.controller')
const ResultController = require('../controllers/result.controller')
const PermissionController = require('../controllers/permission.controller')
const ForumController = require('../controllers/forum.controller')

let authCtrl = new AuthController()
let courseCtrl = new CourseController()
let exreciseCtrl = new ExerciseController()
let questionCtrl = new QuestionController()
let codeController = new CodeController()
let assigneeController = new AssigneeController()
let groupController = new GroupController()
let resultController = new ResultController()
let permissionController = new PermissionController()
let forumController = new ForumController()

// auth
api.post('/login', RequireCapcha, authCtrl.login.bind(authCtrl))
api.post('/register', RequireCapcha, authCtrl.register.bind(authCtrl))
api.get('/token', authCtrl.checkToken.bind(authCtrl))
api.get('/verify/:id', authCtrl.verifyEmail.bind(authCtrl))
// courses
api.get('/courses', RequireLogin, courseCtrl.getCourses.bind(courseCtrl))
api.get('/courses/:id', RequireLogin, courseCtrl.getCourse.bind(courseCtrl))
api.post('/courses', RequireLogin, RequirePermision, courseCtrl.create.bind(courseCtrl))
api.put('/courses/:id', RequireLogin, RequirePermision, courseCtrl.update.bind(courseCtrl))
api.delete('/courses/:id', RequireLogin, RequirePermision, courseCtrl.delete.bind(courseCtrl))
// exercises
api.get('/courses/:id/exercises', RequireLogin, exreciseCtrl.getExercises.bind(exreciseCtrl))
api.get('/courses/:id/exercises/:exercise_id', RequireLogin, exreciseCtrl.getExercise.bind(exreciseCtrl))
api.post('/courses/:id/exercises', RequireLogin, RequirePermision, exreciseCtrl.create.bind(exreciseCtrl))
api.put('/courses/:id/exercises/:exercise_id', RequireLogin, RequirePermision, exreciseCtrl.update.bind(exreciseCtrl))
api.delete('/courses/:id/exercises/:exercise_id', RequireLogin, RequirePermision, exreciseCtrl.delete.bind(exreciseCtrl))

// tuning later
api.get('/courses/:id/exercises/result/:exercise_id', RequireLogin, exreciseCtrl.getResults.bind(exreciseCtrl))
api.get('/courses/:id/exercises/result/:exercise_id/groups/:group_id', RequireLogin, exreciseCtrl.getResultsByGroup.bind(exreciseCtrl))

// questions
api.get('/courses/:id/exercises/:exercise_id/questions', RequireLogin, RequirePermision, questionCtrl.getQuestions.bind(questionCtrl))
api.get('/courses/:id/exercises/:exercise_id/questions/student', RequireLogin, questionCtrl.getQuestionsForStudent.bind(questionCtrl))
api.get('/courses/:id/exercises/:exercise_id/questions/:question_id', RequireLogin, RequirePermision, questionCtrl.getQuestion.bind(questionCtrl))
api.post('/courses/:id/exercises/:exercise_id/questions', RequireLogin, RequirePermision, questionCtrl.create.bind(questionCtrl))
api.put('/courses/:id/exercises/:exercise_id/questions/:question_id', RequireLogin, RequirePermision, questionCtrl.update.bind(questionCtrl))
api.delete('/courses/:id/exercises/:exercise_id/questions/:question_id', RequireLogin, RequirePermision, questionCtrl.delete.bind(questionCtrl))
api.post('/courses/:id/exercises/:exercise_id/questions/review/:question_id', RequireLogin, RequirePermision, questionCtrl.review.bind(questionCtrl))

// admin
api.post('/assignees', RequireLogin, RequirePermision, assigneeController.create.bind(assigneeController))
api.post('/password/change', RequireLogin, authCtrl.changePassword.bind(authCtrl))
api.post('/password/reset', RequireCapcha, authCtrl.resetPassword.bind(authCtrl))
api.post('/register/ta', RequireLogin, RequirePermision, authCtrl.registerTa.bind(authCtrl))
api.get('/emails/:id', RequireLogin, RequirePermision, assigneeController.getEmails.bind(assigneeController))

// groups
api.get('/courses/:id/groups/questions/:question_id', RequireLogin, groupController.getGroups.bind(groupController))
api.get('/courses/:id/exercises/:exercise_id/assigns', RequireLogin, groupController.getAssignResult.bind(groupController))
api.get('/courses/:id/groups/:group_id', RequireLogin, groupController.getGroup.bind(groupController))
api.get('/courses/:id/groups/', RequireLogin, groupController.getGroups.bind(groupController))
api.post('/courses/:id/groups', RequireLogin, groupController.create.bind(groupController))
api.put('/courses/:id/groups/:group_id', RequireLogin, groupController.update.bind(groupController))
api.delete('/courses/:id/groups/:group_id', RequireLogin, groupController.delete.bind(groupController))

// tuning later
api.post('/courses/:id/groups/assign/:group_id', RequireLogin, groupController.assign.bind(groupController))
api.get('/courses/:id/groups/user/:group_id', RequireLogin, groupController.getUsers.bind(groupController))

// permissions
api.post('/permission/create', RequireLogin, permissionController.create.bind(permissionController))
api.get('/group/:group_id/permissions', RequireLogin, permissionController.getPermissions.bind(permissionController))
// code
api.post('/submitcode', RequireLogin, codeController.submitCode.bind(codeController))
api.get('/results', RequireLogin, resultController.getResults.bind(resultController))

// forum
api.get('/forum/getIssue', RequireLogin, forumController.getIssue.bind(forumController))
api.get('/forum/getAllIssues', RequireLogin, forumController.getAllIssues.bind(forumController))
api.post('/forum/createIssue', RequireLogin, forumController.createIssue.bind(forumController))
api.post('/forum/replyIssue', RequireLogin, forumController.replyIssue.bind(forumController))
//api.put('/forum/:id/Issue', RequireLogin, forumController.createIssue.bind(forumController))
api.get('/forum/getIntent', RequireLogin, forumController.getIntent.bind(forumController))
api.post('/forum/createIntent', RequireLogin, forumController.createIntent.bind(forumController))
//api.delete('/forum/deleteProblem', RequireLogin, forumController.createProblem.bind(forumController))

module.exports = api
