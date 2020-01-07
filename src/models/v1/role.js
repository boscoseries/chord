module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.STRING,
    },
  }, {});
  Role.associate = (models) => {
    // associations can be defined here
    Role.belongsToMany(models.Permission, {
      through: 'RolePermission',
      as: 'permissions',
      foreignKey: 'roleId',
      otherKey: 'permissionId',
    });
  };
  return Role;
};
