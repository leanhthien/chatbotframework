const reply = (sequelize, DataTypes) => {
  const Reply = sequelize.define('replies', {
    username: {
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
      beforeCreate: (reply) => {
        reply.is_delete = 0
      }
    }
  })

  Reply.associate = models => {
    Reply.belongsTo(models.User)
  }

  Reply.associate = models => {
    Reply.belongsTo(models.Issue)
  }

  return Reply
}

module.exports = reply
