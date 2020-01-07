module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define('RolePermission', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    roleId: {
      type: DataTypes.STRING,
      field: 'role_id',
    },
    permissionId: {
      type: DataTypes.STRING,
      field: 'permission_id',
    },
  }, {});
  RolePermission.associate = (models) => {
    // associations can be defined here
  };
  return RolePermission;
};
