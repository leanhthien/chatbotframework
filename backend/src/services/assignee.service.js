const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class AssigneeService {
  async create (data) {
    try {
      let course = await Models.Course.findOne({ where: { id: data.course_id } })
      let userEmails = data.user_emails.split(';')
      let users = []
      for (let element of userEmails) {
        users.push(await Models.User.findOne({ where: { email: element } }))
      };
      await course.addUsers(users)
      return true
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getEmails (course_id) {
    try {
      let users = await Models.User.findAll({ where: { role: { [Op.or]: [2, 3] }, is_delete: { [Op.ne]: 1 } }
      })
      if (course_id == -1) return users
      let course = await Models.Course.findOne({ where: { id: course_id },
        include: [{
          model: Models.User
        }] })
      if (!course.users || course.users.length <= 0) return users
      let userIds = []
      course.users.forEach(item => {
        if (item.is_delete !== 1) {
          userIds.push(item.id)
        }
      })
      users = users.filter(item => !userIds.includes(item.id))
      return users
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
}
module.exports = AssigneeService
