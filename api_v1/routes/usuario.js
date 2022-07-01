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

module.exports = router;