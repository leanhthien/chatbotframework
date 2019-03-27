const Sequelize = require('sequelize')
const path = require('path')
require('dotenv').config()
// create a sequelize instance with our local postgres database information.
// const sequelize = new Sequelize('auto_grading', 'postgres', '12345', {
//   dialect: 'postgres'
// })

const sequelize = new Sequelize(process.env.DB_URI)

const models = {
  User: sequelize.import(path.resolve(path.join(__dirname, '/user'))),
  Course: sequelize.import(path.resolve(path.join(__dirname, '/course'))),
  Exercise: sequelize.import(path.resolve(path.join(__dirname, '/exercise'))),
  Question: sequelize.import(path.resolve(path.join(__dirname, '/question'))),
  Submission: sequelize.import(path.resolve(path.join(__dirname, '/submission'))),
  Group: sequelize.import(path.resolve(path.join(__dirname, '/group'))),
  Limit: sequelize.import(path.resolve(path.join(__dirname, '/limit'))),
  Issue: sequelize.import(path.resolve(path.join(__dirname, '/issue')))
}

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models)
  }
})

models.sequelize = sequelize
models.Sequelize = Sequelize

module.exports = models
