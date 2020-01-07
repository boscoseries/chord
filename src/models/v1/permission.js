module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    permission: {
      type: DataTypes.STRING,
    },
  }, {});
  Permission.associate = (models) => {
    // associations can be defined here
    // associations can be defined here
    Permission.belongsToMany(models.Role, {
      through: 'RolePermission',
      as: 'roles',
      foreignKey: 'permissionId',
      otherKey: 'roleId',
    });
  };
  return Permission;
};
