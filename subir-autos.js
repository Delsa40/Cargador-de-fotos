require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CARPETA_IMAGENES = './fotos menos calidad';
const creditos = require('./creditosFotos.json');

// Función para subir una imagen con sus tags
async function subirImagen(nombreArchivo) {
  const ruta = path.join(CARPETA_IMAGENES, nombreArchivo);

  const match = nombreArchivo.match(/^(.+?)_(delantera|trasera)\.(jpe?g|png|webp)$/i);
  if (!match) {
    console.log(`Nombre de archivo no válido: ${nombreArchivo}`);
    return;
  }

  const nombreAuto = match[1];
  const tipo = match[2];

  const public_id = `${nombreAuto}_${tipo}`;
  const tags = [tipo, nombreAuto];

  const infoCredito = creditos[public_id] || {};

  try {
    const result = await cloudinary.uploader.upload(ruta, {
      public_id,
      tags,
      context: { fuente: infoCredito.fuente || '' },
      overwrite: true,
    });
    console.log(`Subido: ${public_id}`);
  } catch (err) {
    console.error(`Error al subir ${nombreArchivo}:`, err.message);
  }
}

async function subirTodas() {
  const archivos = fs.readdirSync(CARPETA_IMAGENES);
  for (const archivo of archivos) {
    await subirImagen(archivo);
  }

  // Búsqueda de todas las imágenes delanteras
  console.log('\nBuscando imágenes delanteras...\n');
  const resultado = await cloudinary.search
    .expression('tags=delantera')
    .sort_by('public_id', 'asc')
    .max_results(100)
    .execute();
}

subirTodas();
