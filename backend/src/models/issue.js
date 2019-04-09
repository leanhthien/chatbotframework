const issue = (sequelize, DataTypes) => {
  const Issue = sequelize.define('issues', {
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    question: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    hooks: {
      beforeCreate: (issue) => {
        issue.is_delete = 0
      }
    }
  })

  Issue.associate = models => {
    Issue.belongsTo(models.User)
  }

  Issue.associate = models => {
    Issue.hasMany(models.Reply, {
      foreignKey: 'issueId',
      as: 'replies',
    })
  }

  return Issue
}

module.exports = issue
