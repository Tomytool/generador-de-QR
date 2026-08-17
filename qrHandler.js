/**
 * Módulo para la gestión, personalización y descarga de códigos QR
 * Soporta colores personalizados y logos centrales en la imagen.
 */

let currentText = '';
let currentOptions = {
  colorDark: '#0f172a',
  colorLight: '#ffffff',
  logoDataUrl: null
};

/**
 * Genera un código QR personalizado en el contenedor especificado
 * @param {HTMLElement} container - Contenedor HTML del QR
 * @param {string} text - Texto o URL a codificar
 * @param {Object} [customOptions] - Opciones de personalización (colorDark, colorLight, logoDataUrl)
 * @returns {Promise<boolean>} Estado de éxito
 */
export async function generarQR(container, text, customOptions = {}) {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return false;
  }

  currentText = trimmedText;
  currentOptions = { ...currentOptions, ...customOptions };

  // Limpiar el contenedor antes de renderizar
  container.innerHTML = '';

  // Instanciar QRCodeJS con alta corrección de errores (Level H) para tolerar el logo central
  new QRCode(container, {
    text: trimmedText,
    width: 240,
    height: 240,
    colorDark: currentOptions.colorDark || '#0f172a',
    colorLight: currentOptions.colorLight || '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });

  // Si hay un logo configurado, superponerlo en el centro del canvas generado
  if (currentOptions.logoDataUrl) {
    await superponerLogoEnCanvas(container, currentOptions.logoDataUrl, currentOptions.colorLight);
  }

  return true;
}

/**
 * Dibuja un logo superpuesto en el centro del canvas del QR
 * @param {HTMLElement} container - Elemento contenedor
 * @param {string} logoSrc - Data URL de la imagen del logo
 * @param {string} bgColor - Color de fondo para el recuadro contenedor del logo
 */
function superponerLogoEnCanvas(container, logoSrc, bgColor = '#ffffff') {
  return new Promise((resolve) => {
    const canvas = container.querySelector('canvas');
    if (!canvas) {
      resolve();
      return;
    }

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // El logo ocupará un 22% del tamaño total del QR para mantener su lecturabilidad
      const logoSize = Math.floor(canvasWidth * 0.22);
      const x = Math.floor((canvasWidth - logoSize) / 2);
      const y = Math.floor((canvasHeight - logoSize) / 2);

      // Margen de protección de 4px alrededor del logo
      const borderPadding = 4;
      const bgX = x - borderPadding;
      const bgY = y - borderPadding;
      const bgSize = logoSize + borderPadding * 2;

      // Dibujar un recuadro suave con bordes redondeados como fondo para el logo
      ctx.fillStyle = bgColor;
      dibujarRectanguloRedondeado(ctx, bgX, bgY, bgSize, bgSize, 6);
      ctx.fill();

      // Borde fino para resaltar el fondo del logo
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Dibujar la imagen del logo recortada con bordes suavemente redondeados
      ctx.save();
      dibujarRectanguloRedondeado(ctx, x, y, logoSize, logoSize, 4);
      ctx.clip();
      ctx.drawImage(img, x, y, logoSize, logoSize);
      ctx.restore();

      // Si QRCodeJS generó una etiqueta <img> auxiliar, actualizar su atributo src con el canvas final
      const qrImg = container.querySelector('img');
      if (qrImg) {
        try {
          qrImg.src = canvas.toDataURL('image/png');
        } catch (e) {
          console.warn('No se pudo actualizar el src de la imagen secundaria:', e);
        }
      }

      resolve();
    };

    img.onerror = () => {
      console.warn('Error al cargar la imagen del logo para el código QR.');
      resolve();
    };

    img.src = logoSrc;
  });
}

/**
 * Función auxiliar para trazar un rectángulo con esquinas redondeadas en Canvas 2D
 */
function dibujarRectanguloRedondeado(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Obtiene el DataURL de la imagen del QR (sea desde canvas o img)
 * @param {HTMLElement} container - Elemento contenedor
 * @returns {string|null} Data URL de la imagen en formato PNG
 */
function obtenerQRDataUrl(container) {
  const canvas = container.querySelector('canvas');
  if (canvas) {
    try {
      return canvas.toDataURL('image/png');
    } catch (err) {
      console.warn('No se pudo convertir canvas a DataURL:', err);
    }
  }

  const img = container.querySelector('img');
  if (img && img.src && img.src.startsWith('data:image/')) {
    return img.src;
  }

  return null;
}

/**
 * Descarga el código QR actual como archivo de imagen PNG
 * @param {HTMLElement} container - Contenedor HTML del código QR
 * @param {string} [filename='codigo-qr.png'] - Nombre opcional del archivo a descargar
 */
export function descargarQR(container, filename = 'codigo-qr.png') {
  const dataUrl = obtenerQRDataUrl(container);

  if (!dataUrl) {
    throw new Error('No hay un código QR válido para descargar.');
  }

  const link = document.createElement('a');
  link.href = dataUrl;

  if (currentText) {
    const sanitizedText = currentText
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 20)
      .toLowerCase();
    if (sanitizedText) {
      filename = `qr_${sanitizedText}.png`;
    }
  }

  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
