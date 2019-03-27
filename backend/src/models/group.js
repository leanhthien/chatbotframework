const group = (sequelize, DataTypes) => {
  const Group = sequelize.define('groups', {
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    hooks: {
      beforeCreate: (group) => {
        group.is_delete = 0
      }
    }
  })

  Group.associate = models => {
    Group.belongsToMany(models.User, { through: 'user_groups' })
  }

  Group.associate = models => {
    Group.belongsToMany(models.Question, { through: models.Limit })
  }

  return Group
}

module.exports = group
