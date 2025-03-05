import React from "react";

const EditProjectForm = ({
  empresa,
  setEmpresa,
  work,
  setWork,
  descripcion,
  setDescripcion,
  contract,
  setContract,
  logo,
  setLogo,
  clientLogo,
  setClientLogo,
  onSave,
  existingLogoURL,
  existingClientLogoURL,
  setIsEditing,
}) => {

  // Función para limpiar los campos del formulario
  const resetForm = () => {
    setEmpresa("");
    setWork("");
    setDescripcion("");
    setContract("");
    setLogo(null);
    setClientLogo(null);
  };

  return (
    <div className="fixed inset-0 z-10 flex justify-center items-center bg-black bg-opacity-50 text-gray-500">
      <div className="bg-white p-8 rounded-lg w-full max-w-lg overflow-y-auto max-h-[80vh] shadow-xl">
        <h2 className="text-lg font-semibold  mb-4">Editar Proyecto</h2>

        {/* Empresa */}
        <div className="mb-4">
          <label className="block  font-semibold mb-2" htmlFor="empresa">
            Empresa
          </label>
          <input
            type="text"
            id="empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            placeholder="Empresa"
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Obra */}
        <div className="mb-4">
          <label className="block  font-semibold mb-2" htmlFor="work">
            Obra
          </label>
          <input
            type="text"
            id="work"
            value={work}
            onChange={(e) => setWork(e.target.value)}
            placeholder="Obra"
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block  font-semibold mb-2" htmlFor="descripcion">
            Contratista
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Contrato */}
        <div className="mb-4">
          <label className="block  font-semibold mb-2" htmlFor="contract">
            Identificación documento
          </label>
          <input
            type="text"
            id="contract"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            placeholder="Contrato"
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Logo Proyecto Actual */}
        <div className="mb-6">
          <label className="block  font-semibold mb-2" htmlFor="existingLogo">
            Logo Proyecto Actual
          </label>
          {existingLogoURL && (
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md shadow-md mb-4">
              <img
                src={existingLogoURL}
                alt="Vista previa Logo Proyecto"
                className="mb-2"
                width="150"
              />
              <p className="text-sm ">Imagen Actual</p>
            </div>
          )}

          {/* Subir Nuevo Logo */}
          <label className="block  font-semibold mb-2" htmlFor="logo">
            Subir Nuevo Logo Proyecto:
          </label>
          <input
            type="file"
            id="logo"
            onChange={(e) => setLogo(e.target.files[0])}
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
          />
          {logo && (
            <div className="flex flex-col items-center bg-blue-50 p-4 rounded-md shadow-md mb-4">
              <img
                src={URL.createObjectURL(logo)}
                alt="Vista previa Logo Proyecto"
                className="mb-2"
                width="150"
              />
              <p className="text-sm ">Vista previa de la nueva imagen</p>
            </div>
          )}
        </div>

        {/* Logo Cliente Actual */}
        <div className="mb-6">
          <label className="block  font-semibold mb-2" htmlFor="existingClientLogo">
            Logo Cliente Actual
          </label>
          {existingClientLogoURL && (
            <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md shadow-md mb-4">
              <img
                src={existingClientLogoURL}
                alt="Vista previa Logo Cliente"
                className="mb-2"
                width="150"
              />
              <p className="text-sm ">Imagen Actual</p>
            </div>
          )}

          {/* Subir Nuevo Logo Cliente */}
          <label className="block  font-semibold mb-2" htmlFor="clientLogo">
            Subir Nuevo Logo Cliente:
          </label>
          <input
            type="file"
            id="clientLogo"
            onChange={(e) => setClientLogo(e.target.files[0])}
            className="block w-full mb-4 px-4 py-2 border border-gray-300 rounded-md"
          />
          {clientLogo && (
            <div className="flex flex-col items-center bg-blue-50 p-4 rounded-md shadow-md mb-4">
              <img
                src={URL.createObjectURL(clientLogo)}
                alt="Vista previa Logo Cliente"
                className="mb-2"
                width="150"
              />
              <p className="text-sm ">Vista previa de la nueva imagen</p>
            </div>
          )}
        </div>

        {/* Botones de guardar y cancelar */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onSave}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Guardar
          </button>
          <button
            onClick={() => { setIsEditing(false); resetForm(); }} // Llamamos a resetForm en el click de cancelar
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectForm;
