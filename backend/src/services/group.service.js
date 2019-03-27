const Logger = require('../libs/logger')
const Models = require('../models/index')
const CsvtojsonV2 = require('csvtojson')
var fs = require('fs')
const Op = Models.Sequelize.Op
class GroupService {
  async getGroupByQuestionId(courseId, questionId) {
    try {
      let allGroups = await this.getAllGroups(courseId)
      let groupFilter = await Models.Group.findAll({
        where: { courseId: courseId, is_delete: { [Op.ne]: 1 } },
        include: {
          model: Models.Question,
          where: { id: questionId, is_delete: { [Op.ne]: 1 } }
        }
      })
      let groups = allGroups.filter((group) => {
        let is_Match = true
        groupFilter.forEach(item => {
          if (group.code === item.code) {
            is_Match = is_Match && false
          }
          is_Match = is_Match && true
        })
        return is_Match
      })
      return groups
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getGroupByEmail(courseId, email) {
    try {
      let user = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
      let groups = await user.getGroups({
        where: { courseId: courseId, is_delete: { [Op.ne]: 1 } }
      })
      return groups
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getGroupByEmail(courseId, email, questionId) {
    try {
      let user = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
      let allGroups = await user.getGroups({
        where: { courseId: courseId, is_delete: { [Op.ne]: 1 } }
      })

      let groupFilter = await user.getGroups({
        where: { courseId: courseId, is_delete: { [Op.ne]: 1 } },
        include: [{
          model: Models.Question,
          where: { id: questionId, is_delete: { [Op.ne]: 1 } }
        }]
      })
      let groups = allGroups.filter((group) => {
        let is_Match = true
        groupFilter.forEach(item => {
          if (group.code === item.code) {
            is_Match = is_Match && false
          }
          is_Match = is_Match && true
        })
        return is_Match
      })
      return groups
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getAssignResult(courseId, exerciseId, email) {
    try {
      let result = []
      let questions = await Models.Question.findAll({
        include: [{
          model: Models.Exercise,
          where: { id: exerciseId, is_delete: { [Op.ne]: 1 } }
        }],
        where: {
          is_delete: { [Op.ne]: 1 }
        }
      })
      let user = await Models.User.findOne({ where: { email: email, is_delete: { [Op.ne]: 1 } } })
     
      for (const item of questions) {
        let groups = await user.getGroups({
          where: { courseId: courseId, is_delete: { [Op.ne]: 1 } },
          include: [{
            model: Models.Question,
            where: { id: item.id, is_delete: { [Op.ne]: 1 } }
          }]
        })
        result.push({
          question: item,
          groups: groups
        })
      }
      return result
    } catch (e) {
      Logger.error(e)
      return null
    }
  }
 
  async getAllGroups(courseId) {
    try {
      let allGroups = await Models.Group.findAll({ where: { courseId: courseId, is_delete: { [Op.ne]: 1 } } })
      return allGroups
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async getGroup(courseId, groupId) {
    try {
      let group = await Models.Group.findOne({ where: { id: groupId, courseId: courseId, is_delete: { [Op.ne]: 1 } } })
      return group
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async create(courseId, data, email) {
    try {
      let newGroup = await Models.Group.create({
        code: data.code,
        name: data.name,
        courseId: courseId,
        description: data.description
      })
      let user = await Models.User.findOne({ where: { email: email } })
      await user.addGroups([newGroup])
      return newGroup
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async update(courseId, id, data) {
    try {
      return await Models.Group.update(
        {
          code: data.code,
          name: data.name,
          description: data.description
        },
        { returning: true, where: { id: id, courseId: courseId } }
      )
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async assign(courseId, groupId, filePath) {
    try {
      let csvStr = fs.readFileSync(filePath, 'utf8')
      let conv = new CsvtojsonV2({})
      let json = await conv.fromString(csvStr)
      let group = await Models.Group.findOne({ where: { id: groupId } })
      for (let userEmail of json) {
        let user = await Models.User.findOne({
          where: { email: userEmail.Email, is_delete: { [Op.ne]: 1 } },
          include: [{
            model: Models.Group
          }]
        })
        if (user && !user.groups.find(x => x.id === groupId)) {
          await user.addGroups([group])
          let course = await Models.Course.findOne({ where: { id: courseId } })
          await course.addUsers([user])
        }
      }
      return true
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  async delete(courseId, groupId) {
    try {
      let newGroup = await Models.Group.update({
        is_delete: 1
      }, { returning: true, where: { id: groupId, courseId: courseId } })
      if (newGroup) {
        return true
      }
      return false
    } catch (e) {
      Logger.error(e)
      return false
    }
  }

  async getUsersByGroup(courseId, groupId) {
    try {
      let users = await Models.User.findAll({
        where: { is_delete: { [Op.ne]: 1 } },
        include: { model: Models.Group, where: { id: groupId, is_delete: { [Op.ne]: 1 } } }
      })
      if (!users || users.length <= 0) return []
      users = users.map(item => {
        return item.email
      })
      return users
    } catch (e) {
      Logger.error(e)
      return false
    }
  }
}
module.exports = GroupService
