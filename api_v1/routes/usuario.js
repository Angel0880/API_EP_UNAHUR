var express = require("express");
var router = express.Router();
var models = require("../models");
const jwtUtils = require("../utils/jwtUtils");

router.post("/registrar", async (req, res) => {
  models.usuario
    .create({
      nombre: req.body.nombre,
      clave: req.body.clave
    })
    .then((usuario) =>
      res.status(201).send({
        id: usuario.id,
        nombre: usuario.nombre,
        clave: usuario.clave,
        token: jwtUtils.generarJwt(usuario.id)
      })
    )
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otro usuario con el mismo nombre");
      } else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`);
        res.sendStatus(500);
      }
    });
});

router.post("/login", async (req, res) => {
  try {
    const usuario = await models.usuario.findOne({
      attributes: ["id", "nombre"],
      where: {
        nombre: req.body.nombre,
        clave: req.body.clave,
      },
    });
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      token: jwtUtils.generarJwt(usuario.id)
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const id = jwtUtils.verificarJwt(token);
    const usuario = await models.usuario.findOne({
      attributes: ["id", "nombre"],
      where: {
        id,
      },
    });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error,
    });
  }
});

const findusuario = (id, { onSuccess, onNotFound, onError }) => {
  models.usuario
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(usuario => (usuario ? onSuccess(usuario) : onNotFound()))
    .catch(() => onError());
};

router.put("/", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const id = jwtUtils.verificarJwt(token);
  const onSuccess = usuario =>
    usuario
      .update({ nombre: req.body.nombre }, { fields: ["nombre"]})
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro usuario con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findusuario(id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const id = jwtUtils.verificarJwt(token);
  const onSuccess = usuario =>
    usuario
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findusuario(id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});


module.exports = router;