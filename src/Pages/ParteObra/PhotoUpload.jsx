import React, { useState } from 'react';

const PhotoUpload = () => {
  const [imageData, setImageData] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result); // Guarda la imagen seleccionada
      };
      reader.readAsDataURL(file); // Convierte la imagen a base64
    }
  };

  const handleTakePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageData(reader.result); // Guarda la imagen tomada
      };
      reader.readAsDataURL(file); // Convierte la imagen a base64
    }
  };

  return (
    <div className="photo-upload-container">
      <h2 className="text-xl font-bold mb-4">Selecciona o toma una foto</h2>
      
      {/* Botones para elegir */}
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => document.getElementById('cameraInput').click()}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Tomar Foto
        </button>

        <button 
          onClick={() => document.getElementById('fileInput').click()}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Seleccionar Foto
        </button>
      </div>

      {/* Ocultamos el input con la cámara y con la selección de archivos */}
      <input
        type="file"
        id="fileInput"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <input
        type="file"
        id="cameraInput"
        accept="image/*"
        capture="camera"
        style={{ display: 'none' }}
        onChange={handleTakePhoto}
      />

      {/* Mostrar la imagen seleccionada o tomada */}
      {imageData && (
        <div className="mt-4">
          <h3 className="font-semibold">Imagen seleccionada/tomada:</h3>
          <img src={imageData} alt="Vista previa" className="w-full max-w-xs mx-auto mt-4" />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
