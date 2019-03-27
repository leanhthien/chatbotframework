const Logger = require('../libs/logger')
const Models = require('../models/index')
const Op = Models.Sequelize.Op
class PermissionService {
  async create(data) {
    try {
      let group = await Models.Group.findOne({ where: { id: data.group_id, is_delete: { [Op.ne]: 1 } } })
      let limits = []
      for (let element of data.unTicks) {
        let limit = await Models.Limit.findOne({ where: { groupId: data.group_id, questionId: element.id, is_delete: { [Op.ne]: 1 } } })
        if (limit) {
          await Models.Limit.update(
            {
              is_delete: 1
            },
            { returning: true, where: { groupId: data.group_id, questionId: element.id, } }
          )
        }
      };

      for (let element of data.tickeds) {
        let question = await Models.Question.findOne({ where: { id: element.id, is_delete: { [Op.ne]: 1 } } })
        limits = await group.addQuestion(question, { through: { start: element.start, end: element.end, order: element.order, is_delete: 0 } })
      };

      return limits
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
  async getPermissions(groupId) {
    try {
      let limit = await Models.Limit.findAll({ where: { groupId: groupId, is_delete: { [Op.ne]: 1 } } })
      return limit
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
}
module.exports = PermissionService
