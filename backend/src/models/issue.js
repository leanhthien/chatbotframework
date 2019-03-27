const issue = (sequelize, DataTypes) => {
  const Issue = sequelize.define('issues', {
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    question: {
      type: DataTypes.STRING,
      allowNull: true
    },
    answer: {
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

  return Issue
}

module.exports = issue
