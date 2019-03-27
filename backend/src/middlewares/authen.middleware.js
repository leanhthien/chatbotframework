
const jwt = require('jsonwebtoken')
require('dotenv').config()

let requireLogin = (req, res, next) => {
  var token = req.headers.authorization
  if (!token) { return res.status(401).send({ auth: false, message: 'No token provided.' }) }
  jwt.verify(token.replace('Bearer ', ''), process.env.SECRET, (err, decoded) => {
    if (err) { return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' }) }
    req.email = decoded.email
    req.role = decoded.role
    next()
  })
}
module.exports = { RequireLogin: requireLogin }
