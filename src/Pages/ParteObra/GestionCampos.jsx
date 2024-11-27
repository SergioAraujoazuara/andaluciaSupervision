import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck, FaExclamationCircle } from "react-icons/fa";
import {
  fetchCampos,
  addCampo,
  addValor,
  deleteCampo,
  deleteValor,
  updateCampo,
  updateValor,
} from "./Helpers/firebaseHelpers";
import { IoIosAddCircle } from "react-icons/io";

const normalizeForValidation = (str) => {
  return str
    .toLowerCase() // Convertir todo a minúsculas
    .replace(/[^\p{L}\p{N}\sñ]/gu, "") // Mantener letras (con acentos), números, espacios y "ñ"
    .replace(/\s+/g, " "); // Reemplazar múltiples espacios por uno
};


const capitalizeWords = (str) => {
  return str.replace(/(^|\s)([^\s]+)/g, (match, space, word) => {
    // Convierte la primera letra de cada palabra a mayúscula y respeta el resto
    return space + word.charAt(0).toUpperCase() + word.slice(1);
  });
};





// Capitalizar primera letra
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1); // Primera letra mayúscula
};

const GestionCampos = () => {
  const [nuevoCampo, setNuevoCampo] = useState("");
  const [valorCampo, setValorCampo] = useState("");
  const [campos, setCampos] = useState([]);
  const [campoSeleccionado, setCampoSeleccionado] = useState("");
  const [editandoCampo, setEditandoCampo] = useState(null);
  const [editandoValor, setEditandoValor] = useState({ campoId: null, valorId: null });
  const [nombreEditado, setNombreEditado] = useState("");
  const [valorEditado, setValorEditado] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [accionModal, setAccionModal] = useState(null);
  const [tipoModal, setTipoModal] = useState("info");
  const [docId, setDocId] = useState(null);

  // Cargar los campos al inicializar el componente
  useEffect(() => {
    const cargarCampos = async () => {
      try {
        const { campos: camposCargados, docId: fetchedDocId } = await fetchCampos();
        setCampos(camposCargados || []);
        setDocId(fetchedDocId);
      } catch (error) {
        mostrarModal(error.message, "error");
      }
    };

    cargarCampos();
  }, []);

  const mostrarModal = (mensaje, tipo = "info", accion = null) => {
    setMensajeModal(mensaje);
    setTipoModal(tipo);
    setAccionModal(() => accion);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setMensajeModal("");
    setAccionModal(null);
    setTipoModal("info");
  };

  const handleAddCampo = async () => {
    const nuevoCampoNormalizado = normalizeForValidation(nuevoCampo);
  
    if (campos.some((campo) => normalizeForValidation(campo.nombre) === nuevoCampoNormalizado)) {
      mostrarModal("El campo ya existe.", "error");
      return;
    }
  
    try {
      const campoCapitalizado = capitalizeWords(nuevoCampo); // Capitalizar antes de guardar
      const nuevosCampos = await addCampo(docId, campos, campoCapitalizado);
      setCampos(nuevosCampos);
      setNuevoCampo("");
      mostrarModal("Campo agregado correctamente.", "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };
  

  const handleAddValor = async () => {
    const valorNormalizado = normalizeForValidation(valorCampo);
  
    const campo = campos.find((campo) => campo.id === campoSeleccionado);
    if (campo && campo.valores.some((valor) => normalizeForValidation(valor.valor) === valorNormalizado)) {
      mostrarModal("El valor ya existe en este campo.", "error");
      return;
    }
  
    try {
      const valorCapitalizado = capitalizeWords(valorCampo); // Capitalizar antes de guardar
      const nuevosCampos = await addValor(docId, campos, campoSeleccionado, valorCapitalizado);
      setCampos(nuevosCampos);
      setValorCampo("");
      mostrarModal("Valor agregado correctamente al campo.", "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };
  

  const handleDeleteCampo = (campoId) =>
    mostrarModal("¿Estás seguro de que deseas eliminar este campo?", "warning", async () => {
      try {
        const nuevosCampos = await deleteCampo(docId, campos, campoId);
        setCampos(nuevosCampos);
        mostrarModal("Campo eliminado correctamente.", "success");
      } catch (error) {
        mostrarModal(error.message, "error");
      }
    });

  const handleDeleteValor = (campoId, valorId) =>
    mostrarModal("¿Estás seguro de que deseas eliminar este valor?", "warning", async () => {
      try {
        const nuevosCampos = await deleteValor(docId, campos, campoId, valorId);
        setCampos(nuevosCampos);
        mostrarModal("Valor eliminado correctamente.", "success");
      } catch (error) {
        mostrarModal(error.message, "error");
      }
    });

  const handleUpdateCampo = async (campoId) => {
    const nombreNormalizado = normalizeForValidation(nombreEditado);

    if (campos.some((campo) => normalizeForValidation(campo.nombre) === nombreNormalizado)) {
      mostrarModal("El nombre del campo ya existe.", "error");
      return;
    }

    try {
      const nuevosCampos = await updateCampo(docId, campos, campoId, nombreEditado);
      setCampos(nuevosCampos);
      setEditandoCampo(null);
      mostrarModal("Campo actualizado correctamente.", "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };

  const handleUpdateValor = async (campoId, valorId) => {
    const valorNormalizado = normalizeForValidation(valorEditado);

    const campo = campos.find((campo) => campo.id === campoId);
    if (campo && campo.valores.some((valor) => normalizeForValidation(valor.valor) === valorNormalizado)) {
      mostrarModal("El valor ya existe en este campo.", "error");
      return;
    }

    try {
      const nuevosCampos = await updateValor(docId, campos, campoId, valorId, valorEditado);
      setCampos(nuevosCampos);
      setEditandoValor({ campoId: null, valorId: null });
      mostrarModal("Valor actualizado correctamente.", "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-gray-500">

      {/* Modal para Notificaciones */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h3
              className={`text-xl font-bold mb-4 ${
                tipoModal === "success"
                  ? "text-green-600"
                  : tipoModal === "warning"
                  ? "text-gray-600"
                  : "text-red-600"
              }`}
            >
              {mensajeModal}
            </h3>
            <div className="flex justify-center gap-4">
              {accionModal && (
                <button
                  onClick={() => {
                    accionModal();
                    cerrarModal();
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
                >
                  Confirmar
                </button>
              )}
              <button
                onClick={cerrarModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-gray-600 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gestión de Campos */}
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-white shadow-xl rounded-md p-6">
          <h3 className="text-md font-semibold text-gray-800 mb-4 flex gap-2 items-center"> <span><IoIosAddCircle /></span>Agrega campos</h3>
          <input
            type="text"
            value={nuevoCampo}
            onChange={(e) => setNuevoCampo(e.target.value)}
            placeholder="Nombre del nuevo campo"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            onClick={handleAddCampo}
            className="w-full mt-4 px-6 py-2 bg-amber-600 text-white font-semibold rounded-md shadow hover:bg-amber-700 transition"
          >
           
            Agregar Campo
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-md p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-4 flex gap-2 items-center"> <span><IoIosAddCircle /></span>Agregar valores</h3>
          <select
            value={campoSeleccionado}
            onChange={(e) => setCampoSeleccionado(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 mb-4"
          >
            <option value="">-- Seleccionar Campo --</option>
            {campos?.map((campo) => (
              <option key={campo.id} value={campo.id}>
                {capitalizeFirstLetter(campo.nombre)}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={valorCampo}
            onChange={(e) => setValorCampo(e.target.value)}
            placeholder="Nuevo valor"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            onClick={handleAddValor}
            className="w-full mt-4 px-6 py-2 bg-amber-600 text-white font-semibold rounded-md shadow hover:bg-amber-700 transition"
          >
            Agregar Valor
          </button>
        </div>
      </div>

      {/* Tabla de Campos y Valores */}
      <div className="mt-8 grid grid-cols-3 gap-8">
        {campos?.map((campo) => (
          <div key={campo.id} className="bg-gray-50 p-4 rounded-md shadow">
            {editandoCampo === campo.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nombreEditado}
                  onChange={(e) => setNombreEditado(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => handleUpdateCampo(campo.id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <FaCheck />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-semibold text-sky-600 border-b-2 w-full pb-4">
                  {capitalizeFirstLetter(campo.nombre)}
                </h4>
                <div className="flex gap-2">
                  <FaEdit
                    className="text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => {
                      setEditandoCampo(campo.id);
                      setNombreEditado(campo.nombre);
                    }}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => handleDeleteCampo(campo.id)}
                  />
                </div>
              </div>
            )}

            <ul className="list-disc pl-5">
              {campo.valores.map((valor) =>
                editandoValor.campoId === campo.id && editandoValor.valorId === valor.id ? (
                  <li key={valor.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={valorEditado}
                      onChange={(e) => setValorEditado(e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={() => handleUpdateValor(campo.id, valor.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      <FaCheck />
                    </button>
                  </li>
                ) : (
                  <li key={valor.id} className="flex justify-between items-center">
                    <span>{capitalizeFirstLetter(valor.valor)}</span>
                    <div className="flex gap-2">
                      <FaEdit
                        className="text-gray-600 cursor-pointer hover:text-gray-800"
                        onClick={() => {
                          setEditandoValor({ campoId: campo.id, valorId: valor.id });
                          setValorEditado(valor.valor);
                        }}
                      />
                      <FaTrash
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        onClick={() => handleDeleteValor(campo.id, valor.id)}
                      />
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default GestionCampos;
