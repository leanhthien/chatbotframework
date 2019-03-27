const intent = (sequelize, DataTypes) => {
  const Intent = sequelize.define('intents', {
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
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

  Intent.associate = models => {
    Intent.belongsTo(models.User)
  }

  return Intent
}

module.exports = intent
