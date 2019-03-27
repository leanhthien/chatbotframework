// type tut = 1
// type lab = 2
const exercise = (sequelize, DataTypes) => {
  const Exercise = sequelize.define('exercises', {
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    type: {
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
      beforeCreate: (exercise) => {
        exercise.is_delete = 0
      }
    }
  })

  Exercise.associate = models => {
    Exercise.belongsTo(models.Course)
  }

  return Exercise
}

module.exports = exercise
