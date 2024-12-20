import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";
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


/**
 * Normalizes a string for validation purposes.
 * Converts the string to lowercase, removes special characters, and trims extra spaces.
 *
 * @param {string} str - The string to normalize.
 * @returns {string} - Normalized string.
 */
const normalizeForValidation = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\sñ]/gu, "")
    .replace(/\s+/g, " ");
};

/**
 * Capitalizes the first letter of each word in a string.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} - Capitalized string.
 */
const capitalizeWords = (str) => {
  return str.replace(/(^|\s)([^\s]+)/g, (match, space, word) => {
    return space + word.charAt(0).toUpperCase() + word.slice(1);
  });
};


/**
 * Capitalizes the first letter of the string.
 *
 * @param {string} str - The string to capitalize.
 * @returns {string} - String with the first letter capitalized.
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const GestionCampos = () => {
  // States for managing fields, field types, values, and modal visibility.
  const [nuevoCampo, setNuevoCampo] = useState("");
  const [tipoCampo, setTipoCampo] = useState("desplegable"); // Estado para seleccionar el tipo de campo
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

  useEffect(() => {
    /**
   * Fetches fields from Firebase on component mount and sets the state.
   */
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

  /**
 * Shows a modal with a custom message and type.
 * Optionally, attaches an action to be executed when the modal is confirmed.
 *
 * @param {string} mensaje - The message to display.
 * @param {string} tipo - The type of modal (info, success, error, warning).
 * @param {Function|null} accion - Optional action to execute on confirmation.
 */
  const mostrarModal = (mensaje, tipo = "info", accion = null) => {
    setMensajeModal(mensaje);
    setTipoModal(tipo);
    setAccionModal(() => accion);
    setModalVisible(true);
  };

  /**
   * Closes the modal and resets its state.
   */
  const cerrarModal = () => {
    setModalVisible(false);
    setMensajeModal("");
    setAccionModal(null);
    setTipoModal("info");
  };

  /**
  * Handles adding a new field to Firebase.
  * Ensures the field name is unique before adding it.
  */
  const handleAddCampo = async () => {
    const nuevoCampoNormalizado = normalizeForValidation(nuevoCampo);

    if (campos.some((campo) => normalizeForValidation(campo.nombre) === nuevoCampoNormalizado)) {
      mostrarModal("El campo ya existe.", "error");
      return;
    }

    try {
      const campoCapitalizado = capitalizeWords(nuevoCampo);
      const nuevosCampos = await addCampo(docId, campos, campoCapitalizado, tipoCampo); // Pasamos el tipo
      setCampos(nuevosCampos);
      setNuevoCampo("");
      setTipoCampo("desplegable"); // Resetear el tipo de campo
      mostrarModal(`Campo tipo ${tipoCampo} agregado correctamente.`, "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };

  /**
   * Handles adding a value to an existing field.
   * Ensures the value is unique before adding it.
   */

  const handleAddValor = async () => {
    const valorNormalizado = normalizeForValidation(valorCampo);

    const campo = campos.find((campo) => campo.id === campoSeleccionado);
    if (campo && campo.valores.some((valor) => normalizeForValidation(valor.valor) === valorNormalizado)) {
      mostrarModal("El valor ya existe en este campo.", "error");
      return;
    }

    try {
      const valorCapitalizado = capitalizeWords(valorCampo);
      const nuevosCampos = await addValor(docId, campos, campoSeleccionado, valorCapitalizado);
      setCampos(nuevosCampos);
      setValorCampo("");
      mostrarModal("Valor agregado correctamente al campo.", "success");
    } catch (error) {
      mostrarModal(error.message, "error");
    }
  };


  /**
   * Handles deleting a field by showing a confirmation modal.
   * Deletes the field if confirmed.
   */
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


  /**
* Handles deleting a value from a field by showing a confirmation modal.
* Deletes the value if confirmed.
*/
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



  /**
   * Handles updating the name or type of a field.
   * Ensures the new name is unique before updating.
   */
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


  /**
   * Handles updating a value within a field.
   * Ensures the new value is unique before updating.
   */
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h3
              className={`text-xl font-bold mb-4 ${tipoModal === "success"
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
                  className="px-6 py-2 bg-red-400 text-white rounded-md shadow hover:bg-red-600 transition"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario para agregar campos */}
        <div className="bg-white shadow-xl rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex gap-2 items-center">
            <IoIosAddCircle className="text-amber-600" /> Agregar Campo
          </h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={nuevoCampo}
              onChange={(e) => setNuevoCampo(e.target.value)}
              placeholder="Nombre del nuevo campo"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            />
            <select
              value={tipoCampo}
              onChange={(e) => setTipoCampo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="desplegable">Select</option>
              <option value="texto">Texto</option>
            </select>
            <button
              onClick={handleAddCampo}
              className="w-1/2 px-6 py-2 bg-amber-600 text-white font-semibold rounded-md shadow hover:bg-amber-700 transition"
            >
              Agregar Campo
            </button>
          </div>
        </div>

        {/* Gestión de valores */}
        <div className="bg-white shadow-xl rounded-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex gap-2 items-center">
            <IoIosAddCircle className="text-amber-600" /> Agregar Valores
          </h3>
          <div className="flex flex-col gap-4">
            <select
              value={campoSeleccionado}
              onChange={(e) => setCampoSeleccionado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">-- Seleccionar Campo --</option>
              {campos
                .filter((campo) => campo.tipo === "desplegable") // Solo mostrar campos tipo select
                .map((campo) => (
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
              className="w-1/2 px-6 py-2 bg-amber-600 text-white font-semibold rounded-md shadow hover:bg-amber-700 transition"
            >
              Agregar Valor
            </button>
          </div>
        </div>
      </div>


      {/* Tabla de Campos y Valores */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        {campos.map((campo) => (
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
                  {capitalizeFirstLetter(campo.nombre)}{" "}
                  <span className="text-sm text-gray-500">({campo.tipo})</span>
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
                    className="text-red-400 cursor-pointer hover:text-red-700"
                    onClick={() => handleDeleteCampo(campo.id)}
                  />
                </div>
              </div>
            )}

            {campo.tipo === "desplegable" && (
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
                          className="text-red-400 cursor-pointer hover:text-red-700"
                          onClick={() => handleDeleteValor(campo.id, valor.id)}
                        />
                      </div>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionCampos;
