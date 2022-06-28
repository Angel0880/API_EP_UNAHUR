var express = require("express");
var router = express.Router();
var models = require("../models");
//var moment = require("moment")

router.get("/", (req, res, next) => {
  const paginaActual = parseInt(req.query.paginaActual) ? parseInt(req.query.paginaActual): 1;
  const cantidadAVer = parseInt(req.query.cantidadAVer) ? parseInt(req.query.cantidadAVer): 999;
  //moment(models.profesor.fechaNac).format("MMMM Do YYYY, h:mm:ss")
  models.profesor.findAll({
      
    attributes: ["id","nombre","apellido","edad","fechaNac","paisOrigen","id_materia"],
    include:[{as:'Materia-Relacionada', model:models.materia, attributes: ["nombre","id_carrera"],
      include:[{as:'Carrera-Relacionada', model:models.carrera, attributes: ["nombre"]
      }]
    }],
    offset: (paginaActual - 1) * cantidadAVer,
    limit: cantidadAVer
  
  }).then(profesor => res.send(profesor)).catch(error => { return next(error)});

});

router.post("/", (req, res) => {
  models.profesor
    .create({ nombre: req.body.nombre, apellido: req.body.apellido, edad: req.body.edad, fechaNac: req.body.fechaNac, paisOrigen: req.body.paisOrigen, id_materia: req.body.id_materia})
    .then(profesor => res.status(201).send({ id: profesor.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findProfesor = (id, { onSuccess, onNotFound, onError }) => {
  models.profesor
    .findOne({
      attributes: ["id","nombre","apellido","edad","fechaNac","paisOrigen","id_materia"],
      where: { id }
    })
    .then(profesor => (profesor ? onSuccess(profesor) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findProfesor(req.params.id, {
    onSuccess: profesor => res.send(profesor),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = profesor =>
  profesor
      .update({ nombre: req.body.nombre, apellido: req.body.apellido, edad: req.body.edad, fechaNac: req.body.fechaNac, paisOrigen: req.body.paisOrigen, id_materia: req.body.id_materia },{ fields: ["nombre","apellido","edad","fechaNac","paisOrigen","id_materia"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro profesor con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findProfesor(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = profesor =>
    profesor
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findProfesor(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;