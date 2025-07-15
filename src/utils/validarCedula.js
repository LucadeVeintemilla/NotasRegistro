// src/utils/validarCedula.js
// Valida la cédula ecuatoriana. Devuelve true si es válida.
export default function validarCedula(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const region = parseInt(cedula.substring(0, 2), 10);
  if (region < 1 || region > 24) return false;

  const ultimo = parseInt(cedula[9], 10);
  const pares = [1, 3, 5, 7].reduce((s, i) => s + parseInt(cedula[i], 10), 0);
  const impares = [0, 2, 4, 6, 8].reduce((s, i) => {
    let n = parseInt(cedula[i], 10) * 2;
    if (n > 9) n -= 9;
    return s + n;
  }, 0);
  const suma = pares + impares;
  const decena = Math.ceil(suma / 10) * 10;
  const digito = (decena - suma) % 10;
  return digito === ultimo;
}
