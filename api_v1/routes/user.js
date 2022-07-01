var express = require("express");
var router = express.Router();
var models = require("../models");
const authServices = require("../services/authServices");

router.post("/registrar", async (req, res) => {
  models.usuario
    .create({
      nombre: req.body.nombre,
      contraseña: req.body.contraseña
    })
    .then((usuario) =>
      res.status(201).send({
        id: usuario.id,
        nombre: usuario.nombre,
        contraseña: usuario.contraseña,
        token: authServices.generarJwt(usuario.id),
      })
    )
    .catch((error) => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res
          .status(400)
          .send("Bad request: existe otra usuario con el mismo nombre");
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
        contraseña: req.body.contraseña,
      },
    });
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      token: authServices.generarJwt(usuario.id),
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
    const id = authServices.verificarJwt(token);
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

module.exports = router;