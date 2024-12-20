import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase_config";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaLock,
} from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";
import {
  MdTextFields,
  MdOutlineFormatListBulleted,
} from "react-icons/md";

/**
 * Normalizes a string for validation by converting it to lowercase,
 * removing special characters, and eliminating spaces.
 *
 * @param {string} str - The string to normalize.
 * @returns {string} - Normalized string.
 */
const normalizeForValidation = (str) =>
  str
    .toLowerCase()
    .replace(/[^\w]/g, "")
    .replace(/\s+/g, "");


/**
* Capitalizes the first letter of each word in a string.
*
* @param {string} str - The string to capitalize.
* @returns {string} - Capitalized string.
*/
const capitalizeWords = (str) =>
  str
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());


const GestionPlantillas = () => {
  // States for managing templates, fields, and modal visibility
  const [plantillas, setPlantillas] = useState([]);
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [nuevaPlantilla, setNuevaPlantilla] = useState("");
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [fijos, setFijos] = useState([
    { id: "observaciones", nombre: "Observaciones", tipo: "texto" },
    { id: "fechaHora", nombre: "Fecha y Hora", tipo: "obligatorio" },
    { id: "imagenes", nombre: "Imágenes", tipo: "obligatorio" },
  ]);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [modalAccion, setModalAccion] = useState(null);

  /**
 * Fetches template and field data from Firestore when the component mounts.
 */
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const opcionesFormularioSnapshot = await getDocs(
          collection(db, "opcionesFormulario")
        );
        const opcionesFormularioData = opcionesFormularioSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        const camposCargados = opcionesFormularioData.flatMap(
          (doc) => doc.campos || []
        );
        setCamposFormulario(camposCargados);

        const plantillasSnapshot = await getDocs(collection(db, "plantillas"));
        const plantillasCargadas = plantillasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlantillas(plantillasCargadas);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);


  /**
  * Displays a modal with a custom message and optional action on confirmation.
  *
  * @param {string} mensaje - Message to display in the modal.
  * @param {Function|null} accion - Optional action to execute on confirmation.
  */
  const mostrarModal = (mensaje, accion = null) => {
    setModalMensaje(mensaje);
    setModalAccion(() => accion);
    setModalVisible(true);
  };

  /**
   * Closes the modal and resets its state.
   */
  const cerrarModal = () => {
    setModalVisible(false);
    setModalMensaje("");
    setModalAccion(null);
  };

  /**
   * Handles creating a new template in Firestore.
   * Validates that the template name is unique and not empty.
   */
  const handleCrearPlantilla = async () => {
    const nombreNormalizado = normalizeForValidation(nuevaPlantilla);

    if (
      !nuevaPlantilla.trim() ||
      plantillas.some(
        (plantilla) =>
          normalizeForValidation(plantilla.nombre) === nombreNormalizado
      )
    ) {
      mostrarModal("El nombre de la plantilla ya existe o es inválido.");
      return;
    }

    const plantilla = {
      nombre: capitalizeWords(nuevaPlantilla),
      campos: [...fijos, ...camposSeleccionados],
    };

    try {
      const docRef = await addDoc(collection(db, "plantillas"), plantilla);
      setPlantillas((prev) => [...prev, { id: docRef.id, ...plantilla }]);
      setNuevaPlantilla("");
      setCamposSeleccionados([]);
      mostrarModal("Plantilla creada correctamente.");
    } catch (error) {
      console.error("Error al crear plantilla:", error);
    }
  };

  /**
  * Handles deleting a template by showing a confirmation modal.
  * Deletes the template if confirmed.
  */
  const handleEliminarPlantilla = (id) => {
    mostrarModal("¿Estás seguro de que deseas eliminar esta plantilla?", async () => {
      try {
        await deleteDoc(doc(db, "plantillas", id));
        setPlantillas((prev) =>
          prev.filter((plantilla) => plantilla.id !== id)
        );
        mostrarModal("Plantilla eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar plantilla:", error);
      }
    });
  };

  /**
 * Toggles the selection of a field.
 * Mandatory fields cannot be deselected.
 *
 * @param {Object} campo - The field to toggle.
 */
  const toggleCampoSeleccionado = (campo) => {
    if (fijos.some((fijo) => fijo.id === campo.id)) return; // No permitir deseleccionar obligatorios
    if (camposSeleccionados.some((c) => c.id === campo.id)) {
      setCamposSeleccionados((prev) =>
        prev.filter((c) => c.id !== campo.id)
      );
    } else {
      setCamposSeleccionados((prev) => [...prev, campo]);
    }
  };

  /**
  * Prepares the component for editing a template by populating fields and states.
  *
  * @param {Object} plantilla - The template to edit.
  */
  const handleEditarPlantilla = (plantilla) => {
    setPlantillaEditando(plantilla);
    setNuevaPlantilla(plantilla.nombre);
    setCamposSeleccionados(plantilla.campos);
  };

  /**
  * Handles updating an existing template in Firestore.
  * Validates that the new name is unique among other templates.
  */
  const handleActualizarPlantilla = async () => {
    if (!plantillaEditando) return;

    const nombreNormalizado = normalizeForValidation(nuevaPlantilla);

    if (
      plantillas.some(
        (plantilla) =>
          plantilla.id !== plantillaEditando.id &&
          normalizeForValidation(plantilla.nombre) === nombreNormalizado
      )
    ) {
      mostrarModal("El nombre de la plantilla ya existe.");
      return;
    }

    const plantillaActualizada = {
      nombre: capitalizeWords(nuevaPlantilla),
      campos: [...fijos, ...camposSeleccionados],
    };

    try {
      await updateDoc(doc(db, "plantillas", plantillaEditando.id), plantillaActualizada);
      setPlantillas((prev) =>
        prev.map((plantilla) =>
          plantilla.id === plantillaEditando.id
            ? { ...plantilla, ...plantillaActualizada }
            : plantilla
        )
      );
      setPlantillaEditando(null);
      setNuevaPlantilla("");
      setCamposSeleccionados([]);
      mostrarModal("Plantilla actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar plantilla:", error);
    }
  };

  return (
    <div className="mt-2 max-w-6xl mx-auto min-h-screen text-gray-500">
      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <div className="flex justify-center mb-4">
              {modalAccion ? (
                <FaExclamationTriangle className="text-yellow-500 text-4xl" />
              ) : modalMensaje.includes("correctamente") ? (
                <FaCheckCircle className="text-green-500 text-4xl" />
              ) : (
                <FaTimesCircle className="text-red-500 text-4xl" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-500 mb-4">
              {modalMensaje}
            </h3>
            <div className="flex justify-center gap-4">
              {modalAccion && (
                <button
                  onClick={() => {
                    modalAccion();
                    cerrarModal();
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700"
                >
                  Confirmar
                </button>
              )}
              <button
                onClick={cerrarModal}
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-md shadow hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crear o Editar Plantilla */}
      <div className="bg-white p-6 rounded-md shadow-xl mb-8 px-6">
        <h3 className="font-semibold text-gray-500 mb-4 flex gap-2 items-center">
          <IoIosAddCircle />
          {plantillaEditando ? "Editar Plantilla" : "Crear Nueva Plantilla"}
        </h3>
        <input
          type="text"
          value={nuevaPlantilla}
          onChange={(e) => setNuevaPlantilla(e.target.value)}
          placeholder="Nombre de la plantilla"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 mb-4"
        />
        <h4 className="text-lg font-medium text-gray-500 mb-2">
          Seleccionar Campos
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...fijos, ...camposFormulario].map((campo) => (
            <label
              key={campo.id}
              className={`flex items-center space-x-2 cursor-pointer ${fijos.some((fijo) => fijo.id === campo.id)
                ? "bg-gray-200 text-gray-500"
                : ""
                }`}
            >
              <input
                type="checkbox"
                checked={camposSeleccionados.some((c) => c.id === campo.id)}
                onChange={() => toggleCampoSeleccionado(campo)}
                disabled={fijos.some((fijo) => fijo.id === campo.id)}
                className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-400"
              />
              <span className="text-sm font-medium text-gray-500 flex items-center gap-2 p-2">
                {campo.tipo === "obligatorio" && (
                  <FaLock className="text-gray-500" title="Obligatorio" />
                )}
                {campo.tipo === "texto" && (
                  <MdTextFields className="text-gray-500" title="Texto" />
                )}
                {campo.tipo === "desplegable" && (
                  <MdOutlineFormatListBulleted
                    className="text-gray-500"
                    title="Desplegable"
                  />
                )}
                {campo.nombre} ({campo.tipo})
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={plantillaEditando ? handleActualizarPlantilla : handleCrearPlantilla}
          className="mt-4 px-6 py-2 bg-amber-600 text-white font-semibold rounded-md shadow hover:bg-amber-700 transition"
        >
          {plantillaEditando ? "Actualizar Plantilla" : "Guardar Plantilla"}
        </button>
      </div>

      {/* Listar plantillas existentes */}
      <div className="mt-12 px-6">
        <h3 className="text-2xl font-semibold text-gray-500 mb-4 w-full border-b-2 pb-4">
          Plantillas Existentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => (
            <div
              key={plantilla.id}
              className="bg-white p-4 rounded-md shadow-md"
            >
              <h4 className="text-lg font-semibold text-sky-600 w-full border-b-2 pb-2">
                {plantilla.nombre}
              </h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-500 flex flex-col gap-3">
                {plantilla.campos.map((campo, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {campo.tipo === "obligatorio" && (
                      <FaLock className="text-gray-500 text-xl" title="Obligatorio" />
                    )}
                    {campo.tipo === "texto" && (
                      <MdTextFields
                        className="text-gray-500 text-xl"
                        title="Texto"
                      />
                    )}
                    {campo.tipo === "desplegable" && (
                      <MdOutlineFormatListBulleted
                        className="text-gray-500 text-xl"
                        title="Desplegable"
                      />
                    )}
                    {campo.nombre} ({campo.tipo || "N/A"})
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditarPlantilla(plantilla)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md shadow hover:bg-blue-700 transition w-full"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarPlantilla(plantilla.id)}
                  className="px-4 py-2 bg-red-400 text-white rounded-md shadow hover:bg-red-700 transition w-full"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GestionPlantillas;
