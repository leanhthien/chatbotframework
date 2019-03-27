const question = (sequelize, DataTypes) => {
  const Question = sequelize.define('questions', {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    order: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sourcecode_name: {
      type: DataTypes.STRING
    },
    sourcecode: {
      type: DataTypes.BLOB('long')
    },
    solution_name: {
      type: DataTypes.STRING
    },
    solution: {
      type: DataTypes.BLOB('long')
    },
    testcase_name: {
      type: DataTypes.STRING
    },
    testcase: {
      type: DataTypes.BLOB('long')
    },
    description: {
      type: DataTypes.BLOB('long'),
      allowNull: true
    },
    num_submit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    show_testcase: {
      type: DataTypes.BLOB('long')
    },
    keyword: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_review: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    hooks: {
      beforeCreate: (question) => {
        // eslint-disable-next-line no-unused-expressions
        question.is_delete = 0
        question.is_review = 0
      }
    }
  })

  Question.associate = models => {
    Question.belongsToMany(models.Group, { through: models.Limit })
  }

  Question.associate = models => {
    Question.belongsTo(models.Exercise)
  }

  return Question
}

module.exports = question
