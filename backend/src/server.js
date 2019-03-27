const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const Routers = require('./routers/index')
const Logger = require('./libs/logger')
const Models = require('./models/index')
const fileUpload = require('express-fileupload')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// invoke an instance of express application.
const app = express()

// upload file
app.use(fileUpload())

// static public folder to make it
app.use(express.static(path.resolve(__dirname + '/../public')))

// initialize body-parser to parse incoming parameters requests to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

// CORS on ExpressJS
app.use(cors())

// only if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
app.enable('trust proxy')
const apiLimiter = rateLimit({
  windowMs: process.env.TIMELIMIT_REQUEST,
  max: process.env.MAX_REQUESTS,
  // allows to create custom keys (by default user IP is used)
  keyGenerator: function (req /*, res */) {
    return req.headers.authorization || req.ip
  },
  handler: (req, res, next) => {
    next()
  }
})

//  apply to all requests
app.use(apiLimiter)
// add router
app.use('/', Routers)

// route for handling 404 requests(unavailable routes)
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that!")
})

// Init router
/**
 * Error handler
 */
process.on('unhandledRejection', function (reason, p) {
  Logger.error('unhandledRejection', reason, p)
})

process.on('uncaughtException', (err) => {
  Logger.error('uncaughtException', err)
})

Models.sequelize.sync({ force: process.env.INIT_DB === 'true' }).then(async () => {
  if (process.env.INIT_DB === 'true') {
    // init temp data
    let course1 = await Models.Course.create({
      code: 'Course1',
      name: 'course 1'
    })
    await Models.Course.create({
      code: 'Course2',
      name: 'course 2'
    })
    let user1 = await Models.User.create({
      username: 'student1',
      fullname: 'abc',
      password: '123456',
      role: '1',
      email: 'student1@gmail.com',
      active: 0
    })
    let user6 = await Models.User.create({
      username: 'student2',
      fullname: 'student2',
      password: '123456',
      role: '1',
      email: 'student2@gmail.com',
      active: 0
    })
    let user3 = await Models.User.create({
      username: 'student3',
      fullname: 'student3',
      password: '123456',
      role: '1',
      email: 'student3@gmail.com',
      active: 0
    })
    let user4 = await Models.User.create({
      username: 'student4',
      fullname: 'student4',
      password: '123456',
      role: '1',
      email: 'student4@gmail.com',
      active: 0
    })
    let user5 = await Models.User.create({
      username: 'student5',
      fullname: 'student5',
      password: '123456',
      role: '1',
      email: 'student5@gmail.com',
      active: 0
    })
    let user7 = await Models.User.create({
      username: 'student6',
      fullname: 'student6',
      password: '123456',
      role: '1',
      email: 'student6@gmail.com',
      active: 0
    })
    let user8 = await Models.User.create({
      username: 'student7',
      fullname: 'student7',
      password: '123456',
      role: '1',
      email: 'student7@gmail.com',
      active: 0
    })
    let user9 = await Models.User.create({
      username: 'student8',
      fullname: 'student8',
      password: '123456',
      role: '1',
      email: 'student8@gmail.com',
      active: 0
    })
    let user10 = await Models.User.create({
      username: 'student9',
      fullname: 'student9',
      password: '123456',
      role: '1',
      email: 'student9@gmail.com',
      active: 0
    })
    let user2 = await Models.User.create({
      username: 'teacher1',
      password: '123456',
      fullname: 'efg',
      role: '2',
      email: 'teacher1@gmail.com',
      active: 0
    })
    await Models.User.create({
      username: 'admin',
      password: '123456',
      fullname: 'admin',
      role: '3',
      email: 'admin@gmail.com',
      active: 1
    })
    let group1 = await Models.Group.create({
      code: 'group1',
      name: 'group 1',
      courseId: course1.id
    })
    await course1.addUsers([user1, user2])
    await user1.addGroups([group1])
    await user2.addGroups([group1])

    let exercise1 = await Models.Exercise.create({
      code: 'exercise 1',
      name: 'exercise 1'
    })
    await exercise1.setCourse(course1)
  }
  // start the express server
  let serverPort = process.env.PORT
  app.listen(serverPort, () => {
    Logger.info(`Started on port ${serverPort}`)
  })
})

module.exports = app
