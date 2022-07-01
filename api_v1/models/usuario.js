'use strict';
module.exports = (sequelize, DataTypes) => {
  const usuario = sequelize.define('usuario', {
    nombre: DataTypes.STRING,
    clave: DataTypes.STRING
  }, {});
  return usuario;
};