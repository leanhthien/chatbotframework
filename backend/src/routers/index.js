const route = require('express').Router()
const ApiRoute = require('./api.route')
const path = require('path')

route.get('/', (req, res) => {
  res.sendFile(path.resolve(path.join(__dirname, '/../public/index.html')))
})
route.use('/api', ApiRoute)
module.exports = route
