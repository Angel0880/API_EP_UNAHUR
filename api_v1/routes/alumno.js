var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res, next) => {
  const paginaActual = parseInt(req.query.paginaActual) ? parseInt(req.query.paginaActual): 1;
  const cantidadAVer = parseInt(req.query.cantidadAVer) ? parseInt(req.query.cantidadAVer): 999;

  models.alumno.findAll({

    attributes: ["id","nombre","apellido","edad","fechaNac","paisOrigen","id_carrera"],  
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}],
    offset: (paginaActual - 1) * cantidadAVer,
    limit: cantidadAVer
    
  }).then(alumnos => res.send(alumnos)).catch(error => { return next(error)});

});

router.get("/porEdad/:orden", (req, res, next) => {
  const paginaActual = parseInt(req.query.paginaActual) ? parseInt(req.query.paginaActual): 1;
  const cantidadAVer = parseInt(req.query.cantidadAVer) ? parseInt(req.query.cantidadAVer): 999;

  models.alumno.findAll({

    attributes: ["id","nombre","apellido","edad","fechaNac","paisOrigen","id_carrera"],
    order: [['edad',req.params.orden]], 
    include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]}],
    offset: (paginaActual - 1) * cantidadAVer,
    limit: cantidadAVer
    
  }).then(alumnos => res.send(alumnos)).catch(error => { return next(error)});

});

router.post("/", (req, res) => {
  models.alumno
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, edad: req.body.edad, fechaNac: req.body.fechaNac, paisOrigen: req.body.paisOrigen, id_carrera: req.body.id_carrera })
    .then(alumno => res.status(201).send({ id: alumno.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAlumno = (id, { onSuccess, onNotFound, onError }) => {
  models.alumno
    .findOne({
      attributes: ["id", "nombre", "apellido", "edad", "fechaNac", "paisOrigen", "id_carrera"],
      where: { id }
    })
    .then(alumno => (alumno ? onSuccess(alumno) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAlumno(req.params.id, {
    onSuccess: alumno => res.send(alumno),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .update(
        { 
          nombre: req.body.nombre, 
          apellido: req.body.apellido, 
          edad: req.body.edad, 
          fechaNac: req.body.fechaNac, 
          paisOrigen: req.body.paisOrigen, 
          id_carrera: req.body.id_carrera 
        }, 
        { 
          fields: ["nombre", "apellido", "edad", "fechaNac", "paisOrigen", "id_carrera"] 
        }
      )
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro alumno con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = alumno =>
    alumno
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAlumno(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;