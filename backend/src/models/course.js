const course = (sequelize, DataTypes) => {
  const Course = sequelize.define('courses', {
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
    }
  },
  {
    hooks: {
      beforeCreate: (course) => {
        course.is_delete = 0
      }
    }
  })

  Course.associate = models => {
    Course.belongsToMany(models.User, { through: 'user_courses' })
  }

  return Course
}

module.exports = course
