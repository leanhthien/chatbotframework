
const UrlPattern = require('url-pattern')

// student 1
// teacher 2
// admin 3

const permissions = [
  {
    pattern: '/courses',
    method: 'POST',
    role: [3]
  },
  {
    pattern: '/courses/:id',
    method: 'PUT',
    role: [3]
  },
  {
    pattern: '/courses/:id',
    method: 'DELETE',
    role: [3]
  },
  {
    pattern: '/register/ta',
    method: 'POST',
    role: [3]
  },
  {
    pattern: '/assignees',
    method: 'POST',
    role: [3]
  },
  {
    pattern: '/emails/:id',
    method: 'GET',
    role: [3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions',
    method: 'GET',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions/:questionId',
    method: 'GET',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions',
    method: 'POST',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions/:questionId',
    method: 'PUT',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions/review/:questionId',
    method: 'POST',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId/questions/:questionId',
    method: 'DELETE',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises',
    method: 'POST',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId',
    method: 'PUT',
    role: [2, 3]
  },
  {
    pattern: '/courses/:id/exercises/:exerciseId',
    method: 'DELETE',
    role: [2, 3]
  }
]

let requirePermision = (req, res, next) => {
  let permission = permissions.find(x => {
    let pattern = new UrlPattern(x.pattern)
    if (pattern.match(req.path) && x.role.includes(req.role) && x.method === req.method) {
      return x
    }
  })
  if (permission) {
    return next()
  }
  return res.status(500).send({ auth: false, message: 'Don\'t have permission.' })
}
module.exports = { RequirePermision: requirePermision }
