'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuario = sequelize.define('usuario', {
    nombre: DataTypes.STRING,
    contraseña: DataTypes.STRING
  }, {});
  return usuario;
};