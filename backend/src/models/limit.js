const limit = (sequelize, DataTypes) => {
  const Limit = sequelize.define('limit', {
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    max_submit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order: {
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
      beforeCreate: (limit) => {
        limit.is_delete = 0
      }
    }
  })

  return Limit
}

module.exports = limit
