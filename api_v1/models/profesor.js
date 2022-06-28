'use strict';
module.exports = (sequelize, DataTypes) => {
  const profesor = sequelize.define('profesor', {
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    edad: DataTypes.INTEGER,
    fechaNac: DataTypes.DATE,
    paisOrigen: DataTypes.STRING,
    id_materia: DataTypes.INTEGER
  }, {});
  profesor.associate = function(models) {
    
    //asociacion a carrera (pertenece a:)
  	profesor.belongsTo(models.materia// modelo al que pertenece
    ,{
      as : 'Materia-Relacionada',  // nombre de mi relacion
      foreignKey: 'id_materia'     // campo con el que voy a igualar
    })
  	/////////////////////

  };
  return profesor;
};