import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../firebase_config";
import { db } from "../../../firebase_config";
import { doc, updateDoc } from "firebase/firestore";
import imageCompression from "browser-image-compression"; // Importa la librería de compresión


const TablaRegistros = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [registrosPorPlantilla, setRegistrosPorPlantilla] = useState({});
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [camposFiltrados, setCamposFiltrados] = useState([]);
  const [valoresFiltro, setValoresFiltro] = useState({});
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Función para comprimir la imagen
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    console.log("Compresion de imagen iniciada", file);
    return await imageCompression(file, options);
  };

  // Función para subir la imagen a Firebase Storage
  const uploadImageWithMetadata = async (file, index) => {
    console.log("Subida de imagen iniciada", file);
    try {
      const storageRef = ref(storage, `imagenes/${Date.now()}_${index}`);
      const metadata = {
        contentType: file.type,
      };
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      console.log("Imagen subida con éxito y URL obtenida:", url);
      return url;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const handleImageEdit = async (e, index) => {
    const file = e.target.files[0]; // Obtener la imagen seleccionada
    if (file) {
      console.log(`Imagen seleccionada en el índice ${index}:`, file);
  
      try {
        // Comprimir la imagen
        const compressedFile = await compressImage(file);
        console.log(`Imagen comprimida en el índice ${index}:`, compressedFile);
  
        // Subir la imagen a Firebase Storage
        const imageUrl = await uploadImageWithMetadata(compressedFile, index);
        console.log(`URL de la imagen subida en el índice ${index}:`, imageUrl);
  
        // Actualizar el estado local con la nueva URL de la imagen
        const updatedRegistro = { ...registroSeleccionado };
        updatedRegistro.imagenes[index] = imageUrl; // Reemplazar la imagen en la posición correspondiente
        setRegistroSeleccionado(updatedRegistro); // Actualizar el estado con el nuevo registro
  
        console.log(`Registro actualizado con la nueva imagen en el índice ${index}:`, updatedRegistro);
  
      } catch (error) {
        console.error(`Error al procesar la imagen en el índice ${index}:`, error);
      }
    }
  };
  

  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const plantillasSnapshot = await getDocs(collection(db, "plantillas"));
        const plantillasCargadas = plantillasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlantillas(plantillasCargadas);
      } catch (error) {
        console.error("Error al cargar plantillas:", error);
      }
    };

    cargarPlantillas();
  }, []);

  useEffect(() => {
    const cargarCamposFiltrados = async () => {
      if (!plantillaSeleccionada) return;

      try {
        const plantilla = plantillas.find((p) => p.nombre === plantillaSeleccionada);
        const opcionesSnapshot = await getDocs(collection(db, "opcionesFormulario"));
        const opcionesCargadas = opcionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const camposCoincidentes = plantilla?.campos
          .map((campo) => {
            const campoOpciones = opcionesCargadas
              .flatMap((doc) => doc.campos)
              .find((op) => op.nombre === campo.nombre);
            return {
              nombre: campo.nombre,
              valores: campoOpciones?.valores || [],
            };
          })
          .filter((campo) => campo.valores.length > 0);

        setCamposFiltrados(camposCoincidentes);
        setValoresFiltro({});
      } catch (error) {
        console.error("Error al cargar campos filtrados:", error);
      }
    };

    cargarCamposFiltrados();
  }, [plantillaSeleccionada, plantillas]);

  const cargarRegistros = async (plantilla) => {
    if (registrosPorPlantilla[plantilla]) {
      console.log(`Usando registros guardados localmente para la plantilla: ${plantilla}`);
      setRegistrosFiltrados(registrosPorPlantilla[plantilla]);
      return;
    }

    console.log(`Realizando consulta a Firestore para la plantilla: ${plantilla}`);

    setLoading(true);

    try {
      const nombreColeccion = `${toCamelCase(plantilla)}Form`;
      const refColeccion = collection(db, nombreColeccion);

      const snapshot = await getDocs(refColeccion);
      const documentos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setRegistrosPorPlantilla((prev) => ({
        ...prev,
        [plantilla]: documentos,
      }));
      setRegistrosFiltrados(documentos);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let registrosFiltrados = registrosPorPlantilla[plantillaSeleccionada] || [];

    // Filtrar por valores seleccionados en los campos
    Object.keys(valoresFiltro).forEach((campo) => {
      if (valoresFiltro[campo] && campo !== "observaciones") { // Excluir Observaciones de este filtro
        const campoNormalizado = campo.toLowerCase().trim();
        registrosFiltrados = registrosFiltrados.filter(
          (registro) =>
            registro[campoNormalizado]?.toString().toLowerCase().trim() ===
            valoresFiltro[campo].toString().toLowerCase().trim()
        );
      }
    });

    // Filtrar por rango de fechas
    if (fechaInicio || fechaFin) {
      const fechaInicioObj = fechaInicio ? new Date(fechaInicio) : null;
      const fechaFinObj = fechaFin
        ? new Date(fechaFin).setHours(23, 59, 59, 999) // Asegurar incluir todo el día
        : null;

      registrosFiltrados = registrosFiltrados.filter((registro) => {
        const fechaRegistro = new Date(registro.fechaHora);
        return (
          (!fechaInicioObj || fechaRegistro >= fechaInicioObj) &&
          (!fechaFinObj || fechaRegistro <= fechaFinObj)
        );
      });
    }

    // Filtro de búsqueda de texto para el campo Observaciones
    if (valoresFiltro["observaciones"]) {
      const textoBusqueda = valoresFiltro["observaciones"].toLowerCase().trim();
      registrosFiltrados = registrosFiltrados.filter((registro) =>
        registro.observaciones?.toLowerCase().includes(textoBusqueda) // Verifica coincidencias parciales
      );
    }

    setRegistrosFiltrados(registrosFiltrados);
  }, [valoresFiltro, registrosPorPlantilla, plantillaSeleccionada, fechaInicio, fechaFin]);




  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const obtenerColumnas = () => {
    const columnasExcluidas = ["tipoFormulario", "imagenes", "id"];
    const columnas = new Set();

    registrosFiltrados.forEach((registro) => {
      Object.keys(registro).forEach((campo) => {
        if (
          registro[campo] &&
          registro[campo] !== "" &&
          !columnasExcluidas.includes(campo)
        ) {
          columnas.add(campo);
        }
      });
    });

    return [...columnas].sort((a, b) => a.localeCompare(b));
  };

  const handleFiltroCambio = (campo, valor) => {
    setValoresFiltro((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };


  // Modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(""); // Contenido dinámico del modal

const [alertModalVisible, setAlertModalVisible] = useState(false); // Modal de alerta
const [alertMessage, setAlertMessage] = useState("");  // Mensaje de la alerta

  // Editar modal
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null);

  const handleGuardar = async () => {
    try {
      console.log("Guardando el registro actualizado:", registroSeleccionado);
  
      // Asegúrate de que las imágenes han sido subidas y actualizadas en el estado
      const updatedRegistro = { ...registroSeleccionado };
  
      // Si se han subido nuevas imágenes, debes actualizarlas en Firestore
      const docRef = doc(db, `${toCamelCase(plantillaSeleccionada)}Form`, registroSeleccionado.id);
  
      // Actualiza el documento con las nuevas imágenes y los valores modificados
      await updateDoc(docRef, updatedRegistro);
  
      console.log("Documento actualizado correctamente");
  
      // Actualizar el estado localmente en registrosFiltrados para reflejar el cambio
      setRegistrosFiltrados((prevRegistros) =>
        prevRegistros.map((registro) =>
          registro.id === updatedRegistro.id ? updatedRegistro : registro
        )
      );
  
      setAlertMessage("El registro se actualizó correctamente.");
      setAlertModalVisible(true);
  
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar el documento:", error);
  
      setAlertMessage("Hubo un error al actualizar el registro.");
      setAlertModalVisible(true);
    }
  };
  
  
  
  
  
  

  return (
    <div className="p-8 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Registros de Formularios</h1>

      {/* Selección de Plantilla */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {plantillas.map((plantilla) => (
          <button
            key={plantilla.id}
            onClick={() => {
              setPlantillaSeleccionada(plantilla.nombre);
              cargarRegistros(plantilla.nombre);
            }}
            className={`px-6 py-2 rounded-md font-semibold shadow-md ${plantillaSeleccionada === plantilla.nombre
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
              } hover:bg-blue-500 transition`}
          >
            {plantilla.nombre}
          </button>
        ))}
      </div>

      {/* Filtros dinámicos */}
      {camposFiltrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-xs">
          {camposFiltrados.map((campo, index) => (
            <div key={index} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-2">
                {capitalizeFirstLetter(campo.nombre)}
              </label>
              <select
                value={valoresFiltro[campo.nombre] || ""}
                onChange={(e) => handleFiltroCambio(campo.nombre, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option value="">Todos</option>
                {[...campo.valores]
                  .sort((a, b) => a.valor.localeCompare(b.valor))
                  .map((valor, i) => (
                    <option key={i} value={valor.valor}>
                      {capitalizeFirstLetter(valor.valor)}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          {/* Filtros de fecha */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
          {/* Input de búsqueda para Observaciones */}
          <div className="flex flex-col mb-4">
            <label className="text-sm font-semibold text-gray-600 mb-2">Buscar en Observaciones</label>
            <input
              type="text"
              value={valoresFiltro["observaciones"] || ""}
              onChange={(e) => handleFiltroCambio("observaciones", e.target.value)}
              placeholder="Escribe para buscar..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>

        </div>

      )}



      {/* Tabla de registros */}
      {plantillaSeleccionada && (
        <>
          {loading ? (
            <p className="text-center text-gray-500 mt-8">Cargando registros...</p>
          ) : registrosFiltrados.length > 0 ? (
            <div className="overflow-x-auto bg-gray-50 p-6 rounded-md shadow-lg">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {obtenerColumnas().map((columna, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left text-sm text-gray-700"
                      >
                        {capitalizeFirstLetter(columna)}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-blue-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                    >
                      {obtenerColumnas().map((columna, colIndex) => (
                        <td key={colIndex} className="border px-4 py-2 text-gray-800">
                          {registro[columna] || ""}
                        </td>
                      ))}
                      {/* Columna de acciones */}
                      <td className="border px-4 py-2 text-gray-800">
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-md mr-2"
                          onClick={() => {
                            console.log("Registro seleccionado:", registro); // Aquí imprimimos el registro en la consola
                            setRegistroSeleccionado(registro); // Asegúrate de que 'registro' tiene las imágenes
                            setModalContent("Editar");
                            setModalVisible(true);
                          }}


                        >
                          Editar
                        </button>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-md"
                          onClick={() => {
                            setModalContent("Eliminar");
                            setModalVisible(true);
                          }}
                        >
                          Eliminar
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              No se encontraron registros para la plantilla seleccionada.
            </p>
          )}
        </>
      )}

      {modalVisible && modalContent === "Editar" && registroSeleccionado && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">Editar Registro</h2>

            {/* Mostrar campos del registro */}
            {Object.keys(registroSeleccionado)
              .filter((campo) => campo !== "imagenes") // Excluimos las imágenes para tratarlas por separado
              .map((campo, index) => {
                // Normalizamos el nombre del campo a minúsculas para comparación
                const campoDinamico = camposFiltrados.find(c => c.nombre.toLowerCase() === campo.toLowerCase());

                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {capitalizeFirstLetter(campo)}
                    </label>

                    {/* Si el campo tiene valores posibles, se muestra un select */}
                    {campoDinamico && campoDinamico.valores.length > 0 ? (
                      <select
                        value={registroSeleccionado[campo] || ""}
                        onChange={(e) =>
                          setRegistroSeleccionado((prev) => ({
                            ...prev,
                            [campo]: e.target.value,
                          }))
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Seleccionar</option>
                        {campoDinamico.valores.map((valor) => (
                          <option key={valor.id} value={valor.valor}>
                            {valor.valor}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Si no tiene valores posibles, se muestra un input de texto
                      <input
                        type="text"
                        value={registroSeleccionado[campo] || ""}
                        onChange={(e) =>
                          setRegistroSeleccionado((prev) => ({
                            ...prev,
                            [campo]: e.target.value,
                          }))
                        }
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                  </div>
                );
              })}

            {/* Mostrar y cargar imágenes */}
            <div className="mb-4">
  <label className="block text-sm font-semibold text-gray-600 mb-2">
    Imágenes
  </label>
  {registroSeleccionado.imagenes && registroSeleccionado.imagenes.map((imagen, index) => (
    <div key={index} className="flex items-center gap-2 mb-2">
      <img
        src={imagen} // Mostrar la imagen
        alt={`Imagen ${index + 1}`}
        className="w-16 h-16 object-cover rounded-md border"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageEdit(e, index)} // Llamar a la función de edición
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
      />
    </div>
  ))}
</div>


            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md mr-2"
                onClick={handleGuardar} // Llamamos a la función de guardar aquí
              >
                Guardar
              </button>

              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={() => setModalVisible(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

{alertModalVisible && (
  <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded-md shadow-md w-96 max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-center">Actualización</h2>
      <p className="text-sm text-center text-gray-600 mb-4">{alertMessage}</p>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => setAlertModalVisible(false)} // Cierra el modal de alerta
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
)}



    </div>



  );
};

export default TablaRegistros;
