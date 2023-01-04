const contenedorQR = document.getElementById('contenedorQR');

const textIngreso = document.getElementById('ingreso');
const botonIngreso = document.getElementById('generar');

const Qr = new QRCode(contenedorQR);

botonIngreso.addEventListener('click', (e) => {
  e.preventDefault();
  generar();
});

function generar() {
  let dato = textIngreso.value;
  console.log(dato);
  Qr.makeCode(dato);
}
