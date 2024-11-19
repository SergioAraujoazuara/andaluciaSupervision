import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase_config";
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

const GestionPlantillas = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [campos, setCampos] = useState([]);
  const [camposFormulario, setCamposFormulario] = useState([]);
  const [nuevaPlantilla, setNuevaPlantilla] = useState("");
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [fijos, setFijos] = useState([
    { id: "observaciones", nombre: "Observaciones" },
    { id: "fechaHora", nombre: "Fecha y Hora" },
    { id: "imagenes", nombre: "Imágenes" },
  ]);
  const [plantillaEditando, setPlantillaEditando] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMensaje, setModalMensaje] = useState("");
  const [modalAccion, setModalAccion] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const opcionesFormularioSnapshot = await getDocs(collection(db, "opcionesFormulario"));
        const opcionesFormularioData = opcionesFormularioSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const camposCargados = opcionesFormularioData.flatMap((doc) => doc.campos || []);
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

  const mostrarModal = (mensaje, accion = null) => {
    setModalMensaje(mensaje);
    setModalAccion(() => accion);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setModalMensaje("");
    setModalAccion(null);
  };

  const handleCrearPlantilla = async () => {
    if (!nuevaPlantilla.trim()) {
      mostrarModal("El nombre de la plantilla no puede estar vacío.");
      return;
    }

    const plantilla = {
      nombre: nuevaPlantilla,
      campos: camposSeleccionados,
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

  const handleEliminarPlantilla = (id) => {
    mostrarModal("¿Estás seguro de que deseas eliminar esta plantilla?", async () => {
      try {
        await deleteDoc(doc(db, "plantillas", id));
        setPlantillas((prev) => prev.filter((plantilla) => plantilla.id !== id));
        mostrarModal("Plantilla eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar plantilla:", error);
      }
    });
  };

  const toggleCampoSeleccionado = (campo) => {
    if (camposSeleccionados.some((c) => c.id === campo.id)) {
      setCamposSeleccionados((prev) => prev.filter((c) => c.id !== campo.id));
    } else {
      setCamposSeleccionados((prev) => [...prev, campo]);
    }
  };

  const handleEditarPlantilla = (plantilla) => {
    setPlantillaEditando(plantilla);
    setNuevaPlantilla(plantilla.nombre);
    setCamposSeleccionados(plantilla.campos);
  };

  const handleActualizarPlantilla = async () => {
    if (!plantillaEditando) return;

    const plantillaActualizada = {
      nombre: nuevaPlantilla,
      campos: camposSeleccionados,
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
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Gestión de Plantillas</h1>

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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{modalMensaje}</h3>
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
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crear o Editar Plantilla */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {plantillaEditando ? "Editar Plantilla" : "Crear Nueva Plantilla"}
        </h3>
        <input
          type="text"
          value={nuevaPlantilla}
          onChange={(e) => setNuevaPlantilla(e.target.value)}
          placeholder="Nombre de la plantilla"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 mb-4"
        />
        <h4 className="text-lg font-medium text-gray-700 mb-2">Seleccionar Campos</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...fijos, ...campos, ...camposFormulario].map((campo) => (
            <label key={campo.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={camposSeleccionados.some((c) => c.id === campo.id)}
                onChange={() => toggleCampoSeleccionado(campo)}
                className="h-4 w-4 text-sky-500 border-gray-300 rounded focus:ring-sky-400"
              />
              <span className="text-sm font-medium text-gray-800">{campo.nombre}</span>
            </label>
          ))}
        </div>
        <button
          onClick={plantillaEditando ? handleActualizarPlantilla : handleCrearPlantilla}
          className="mt-4 px-6 py-2 bg-sky-600 text-white font-semibold rounded-md shadow hover:bg-sky-700 transition w-full"
        >
          {plantillaEditando ? "Actualizar Plantilla" : "Crear Plantilla"}
        </button>
      </div>

      {/* Listar plantillas existentes */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Plantillas Existentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plantillas.map((plantilla) => (
            <div key={plantilla.id} className="bg-white p-4 rounded-md shadow-md">
              <h4 className="text-lg font-semibold text-sky-600">{plantilla.nombre}</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {plantilla.campos.map((campo, index) => (
                  <li key={index}>{typeof campo === "string" ? campo : campo.nombre}</li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEditarPlantilla(plantilla)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition w-full"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminarPlantilla(plantilla.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition w-full"
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
