const jwt = require("jsonwebtoken");
const clave_reservada = "clave-reservada";

//Genera el jwt, es decir el token

const generarJwt = (data) => {
  return jwt.sign(data, clave_reservada);
};

//Desencripta la informacion 

const verificarJwt = (token) => {
  return jwt.verify(token, clave_reservada);
};

const jwtUtils = {
  generarJwt,
  verificarJwt,
};

module.exports = jwtUtils;

