const jwt = require("jsonwebtoken");
const clave_reservada = "clave-reservada";

const generarJwt = (data) => {
  return jwt.sign(data, clave_reservada);
};

const verificarJwt = (token) => {
  return jwt.verify(token, clave_reservada);
};

const jwtUtils = {
  generarJwt,
  verificarJwt,
};

module.exports = jwtUtils;

