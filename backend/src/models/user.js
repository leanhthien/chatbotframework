// setup User model and its fields.
// student role 1
// teacher role 2
// admin role 3

const bcrypt = require('bcrypt')
const user = (sequelize, DataTypes) => {
  const User = sequelize.define('users', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    fullname: {
      type: DataTypes.STRING,
      unique: false,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    active: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_delete: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    number_rand: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync()
        user.password = bcrypt.hashSync(user.password, salt)
        user.is_delete = 0
      }
    }
  })

  User.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password)
  }

  User.associate = models => {
    User.belongsToMany(models.Course, { through: 'user_courses' })
  }

  User.associate = models => {
    User.belongsToMany(models.Group, { through: 'user_groups' })
  }

  return User
}

// export User model for use in other files.
module.exports = user
