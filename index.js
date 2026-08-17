import { generarQR, descargarQR } from './qrHandler.js';

document.addEventListener('DOMContentLoaded', () => {
  const contenedorQR = document.getElementById('contenedorQR');
  const textIngreso = document.getElementById('ingreso');
  const formQR = document.getElementById('formQR');
  const botonDescargar = document.getElementById('descargar');
  const placeholderQR = document.getElementById('placeholderQR');
  const feedbackMsg = document.getElementById('feedbackMsg');

  // Elementos de Personalización de Colores y Logo
  const colorDarkInput = document.getElementById('colorDark');
  const colorDarkHex = document.getElementById('colorDarkHex');
  const colorLightInput = document.getElementById('colorLight');
  const colorLightHex = document.getElementById('colorLightHex');

  const logoInput = document.getElementById('logoInput');
  const logoPreviewArea = document.getElementById('logoPreviewArea');
  const logoPreviewImg = document.getElementById('logoPreviewImg');
  const removeLogoBtn = document.getElementById('removeLogoBtn');
  const uploadText = document.getElementById('uploadText');

  let currentLogoDataUrl = null;

  /**
   * Muestra un mensaje de retroalimentación al usuario
   */
  function mostrarFeedback(msg, type = 'info') {
    if (!feedbackMsg) return;
    feedbackMsg.textContent = msg;
    feedbackMsg.className = `feedback-msg feedback-${type} visible`;

    setTimeout(() => {
      feedbackMsg.className = 'feedback-msg';
    }, 3500);
  }

  /**
   * Obtiene la configuración actual de personalización
   */
  function obtenerOpciones() {
    return {
      colorDark: colorDarkInput.value,
      colorLight: colorLightInput.value,
      logoDataUrl: currentLogoDataUrl
    };
  }

  /**
   * Genera o regenera el código QR con las opciones actuales
   */
  async function procesarGeneracion() {
    const dato = textIngreso.value;
    if (!dato.trim()) {
      mostrarFeedback('Por favor, ingresa un texto o enlace válido.', 'error');
      textIngreso.focus();
      return;
    }

    if (placeholderQR) {
      placeholderQR.style.display = 'none';
    }

    const opciones = obtenerOpciones();
    const exito = await generarQR(contenedorQR, dato, opciones);

    if (exito) {
      botonDescargar.disabled = false;
      botonDescargar.classList.add('activo');
    }
  }

  // Evento submit del formulario
  formQR.addEventListener('submit', async (e) => {
    e.preventDefault();
    await procesarGeneracion();
    mostrarFeedback('¡Código QR generado con éxito!', 'success');
  });

  // Manejar cambio en los selectores de color
  colorDarkInput.addEventListener('input', () => {
    colorDarkHex.textContent = colorDarkInput.value.toUpperCase();
    if (textIngreso.value.trim() && contenedorQR.children.length > 0) {
      procesarGeneracion();
    }
  });

  colorLightInput.addEventListener('input', () => {
    colorLightHex.textContent = colorLightInput.value.toUpperCase();
    if (textIngreso.value.trim() && contenedorQR.children.length > 0) {
      procesarGeneracion();
    }
  });

  // Manejar la carga de la imagen/logo central
  logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      mostrarFeedback('El archivo seleccionado debe ser una imagen válida.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      currentLogoDataUrl = evt.target.result;
      logoPreviewImg.src = currentLogoDataUrl;
      logoPreviewArea.style.display = 'flex';
      uploadText.textContent = 'Cambiar imagen';

      // Si ya hay un QR generado, actualizarlo inmediatamente con el logo
      if (textIngreso.value.trim() && contenedorQR.children.length > 0) {
        procesarGeneracion();
      }
    };
    reader.readAsDataURL(file);
  });

  // Eliminar el logo seleccionado
  removeLogoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    currentLogoDataUrl = null;
    logoInput.value = '';
    logoPreviewImg.src = '';
    logoPreviewArea.style.display = 'none';
    uploadText.textContent = 'Subir imagen o logo';

    if (textIngreso.value.trim() && contenedorQR.children.length > 0) {
      procesarGeneracion();
    }
  });

  // Manejar descarga en PNG
  botonDescargar.addEventListener('click', () => {
    try {
      descargarQR(contenedorQR);
      mostrarFeedback('Descarga iniciada en formato PNG.', 'success');
    } catch (error) {
      console.error(error);
      mostrarFeedback(error.message || 'Error al descargar el código QR.', 'error');
    }
  });
});
