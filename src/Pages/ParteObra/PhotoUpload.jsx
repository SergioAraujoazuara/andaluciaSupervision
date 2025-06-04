import React from 'react';

const PhotoUpload = ({ index, onFileSelected }) => {
  

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file, index);
    }
  };

  const handleTakePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file, index);
    }
  };

  return (
    <div className="photo-upload-container">
      {/* Eliminar título local, será manejado por el padre */}
      {/* Eliminar previsualización de imagen, será manejado por el padre */}
      
      {/* Botones para elegir */}
      <div className="flex gap-2 mb-2">
        <button 
          type="button"
          onClick={() => document.getElementById(`cameraInput-${index}`).click()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
        >
          Usar Cámara
        </button>

        <button 
          type="button"
          onClick={() => document.getElementById(`fileInput-${index}`).click()}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm"
        >
          Elegir Archivo
        </button>
      </div>

      {/* Ocultamos el input con la cámara y con la selección de archivos */}
      <input
        type="file"
        id={`fileInput-${index}`}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        type="file"
        id={`cameraInput-${index}`}
        accept="image/*"
        capture="camera"
        className="hidden"
        onChange={handleTakePhoto}
      />

      {/* La previsualización y el manejo del estado de la imagen se harán en el componente padre */}

    </div>
  );
};

export default PhotoUpload;
