const submission = (sequelize, DataTypes) => {
  const Submission = sequelize.define('submissions', {
    type: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    data: {
      type: DataTypes.BLOB('long')
    },
    num_success: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    log: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    num_testcase: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    hooks: {
      beforeCreate: (submission) => {
        submission.is_delete = 0
      }
    }
  })

  Submission.associate = models => {
    Submission.belongsTo(models.User)
  }

  return Submission
}

module.exports = submission
