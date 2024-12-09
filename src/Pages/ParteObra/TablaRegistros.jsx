import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDoc } from 'firebase/firestore';
import { storage } from "../../../firebase_config";
import { db } from "../../../firebase_config";
import { doc, updateDoc, addDoc } from "firebase/firestore";
import imageCompression from "browser-image-compression"; // Importa la librería de compresión
import { deleteDoc } from "firebase/firestore";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { MdOutlineHistoryToggleOff } from "react-icons/md";

import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import InformePDF from "../ParteObra/InformePDF.jsx";
import { useAuth } from '../../context/authContext';
import MapWithButton from "./MapWithButton.jsx";

const TablaRegistros = () => {
  const { user } = useAuth();
  const [plantillas, setPlantillas] = useState([]);
  const [registrosPorPlantilla, setRegistrosPorPlantilla] = useState({});
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [camposFiltrados, setCamposFiltrados] = useState([]);
  const [valoresFiltro, setValoresFiltro] = useState({});
  const today = new Date().toISOString().split("T")[0]; // Obtiene la fecha actual en formato YYYY-MM-DD
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(today);

  const [userNombre, setUserNombre] = useState('');

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'usuarios', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data(); // Obtenemos los datos del documento
          setUserNombre(userData.nombre); // Establecemos el nombre del usuario

          console.log(userData.nombre)
        }
      });
    } else {
      setUserNombre(''); // Limpia el estado si no hay usuario
      setUserRol('');
    }
  }, [user]);


  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navega hacia atrás en el historial
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
    if (!plantilla || !fechaInicio || !fechaFin) {
      setRegistrosFiltrados([]); // Si falta alguno de los parámetros, limpiar los registros
      return;
    }

    console.log(`Cargando registros para la plantilla: ${plantilla} entre ${fechaInicio} y ${fechaFin}`);

    setLoading(true);

    try {
      const nombreColeccion = `${toCamelCase(plantilla)}Form`;
      const refColeccion = collection(db, nombreColeccion);

      const snapshot = await getDocs(refColeccion);
      const documentos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filtrar por rango de fechas
      const fechaInicioObj = new Date(fechaInicio);
      const fechaFinObj = new Date(fechaFin).setHours(23, 59, 59, 999);

      const registrosFiltrados = documentos.filter((registro) => {
        const fechaRegistro = new Date(registro.fechaHora);
        return fechaRegistro >= fechaInicioObj && fechaRegistro <= fechaFinObj;
      });

      setRegistrosPorPlantilla((prev) => ({
        ...prev,
        [plantilla]: registrosFiltrados, // Guardar los registros filtrados en memoria local
      }));

      setRegistrosFiltrados(registrosFiltrados); // Establecer los registros filtrados
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (plantillaSeleccionada && fechaInicio && fechaFin) {
      cargarRegistros(plantillaSeleccionada);
    }
  }, [plantillaSeleccionada, fechaInicio, fechaFin]);


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

  // Imagenes

  const [compressedImages, setCompressedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]); // Previsualización de imágenes

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

  const uploadImageWithMetadata = async (file, index) => {
    const coordinates = manualCoordinates[index] || geolocalizacion; // Usar manuales si están disponibles
    if (!coordinates) {
      throw new Error("Coordenadas no disponibles.");
    }

    const storageRef = ref(storage, `imagenes/${Date.now()}_${index}`);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        latitude: coordinates.lat.toString(),
        longitude: coordinates.lng.toString(),
      },
    };

    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };



  const handleFileChange = async (e, index) => {
    const file = e.target.files[0]; // Obtener el archivo seleccionado
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Generar una URL temporal para la previsualización
      setImagePreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = imageUrl;
        return newPreviews;
      });

      try {
        const compressedFile = await compressImage(file); // Comprimir la imagen
        setCompressedImages((prev) => {
          const updatedImages = [...prev];
          updatedImages[index] = compressedFile; // Guardar el archivo comprimido para subirlo más tarde
          return updatedImages;
        });
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
      }
    }
  };


  const [registroAnterior, setRegistroAnterior] = useState(null); // Estado para capturar el registro antes de los cambios


  // Función para guardar el registro
  const handleGuardar = async () => {
    try {
      // 1. Validar que el campo motivoCambio no esté vacío
      if (!motivoCambio.trim()) {
        showModal("El campo 'Motivo del cambio' es obligatorio.", "error");
        return; // Detener la ejecución si no está lleno
      }

      // 2. Verificar que el registro anterior esté disponible
      if (!registroAnterior) {
        console.error("El estado del registro anterior no está definido.");
        return;
      }

      console.log("Estado anterior del registro:", registroAnterior);

      // 3. Crear una copia para el registro actualizado
      const updatedRegistro = { ...registroSeleccionado };

      // 4. Subir solo las imágenes comprimidas que han sido modificadas
      const updatedImages = await Promise.all(
        Array.from({ length: 4 }).map(async (_, index) => {
          if (compressedImages[index]) {
            const newImageUrl = await uploadImageWithMetadata(compressedImages[index], index);
            return newImageUrl;
          }
          return registroSeleccionado.imagenes?.[index] || "";
        })
      );

      updatedRegistro.imagenes = updatedImages;

      // 5. Referencia al documento principal en Firestore
      const docRef = doc(db, `${toCamelCase(plantillaSeleccionada)}Form`, updatedRegistro.id);

      // 6. Crear objeto del historial
      const historialModificacion = {
        registroId: registroSeleccionado.id, // ID del registro modificado
        responsable: userNombre, // Cambiar por el ID del usuario si es necesario en el futuro
        fechaHora: new Date().toISOString(), // Captura automática de fecha y hora
        motivoCambio, // Motivo del cambio introducido por el usuario
        registroAnterior, // Estado anterior del registro (capturado al abrir el modal)
        registroNuevo: updatedRegistro, // Estado actualizado del registro
      };

      // 7. Guardar en la colección de historialModificaciones
      await addDoc(collection(db, "historialModificaciones"), historialModificacion);
      console.log("Historial guardado correctamente");

      // 8. Actualizar el documento principal en Firestore
      await updateDoc(docRef, updatedRegistro);
      console.log("Documento actualizado correctamente");

      // 9. Actualizar el estado global
      setRegistrosFiltrados((prev) =>
        prev.map((registro) =>
          registro.id === updatedRegistro.id ? updatedRegistro : registro
        )
      );

      // 10. Actualizar el registro seleccionado localmente
      setRegistroSeleccionado((prev) => ({
        ...prev,
        imagenes: updatedImages,
      }));

      // 11. Sincronizar las previsualizaciones con las URLs de Firebase Storage
      setImagePreviews(updatedImages);

      // 12. Cerrar el modal
      setModalVisible(false);

      // 13. Limpiar el motivo del cambio
      setMotivoCambio("");

      // 14. Mostrar mensaje de éxito
      showModal("El registro se actualizó correctamente.", "success");
    } catch (error) {
      // Manejo de errores
      console.error("Error al actualizar el documento:", error);
      showModal("Hubo un error al actualizar el registro.", "error");
    }
  };








  // Función para mostrar el modal
  const showModal = (message, type) => {
    setAlertMessage(message); // Set the message to display
    setModalType(type); // Set the type to either "success" or "error"
    setAlertModalVisible(true); // Show the modal
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setAlertModalVisible(false); // Hide the modal
    setAlertMessage(""); // Clear the message
    setModalType(""); // Reset the modal type
  };


  const [modalType, setModalType] = useState(""); // Modal type ("success" or "error")

  useEffect(() => {
    // Limpiar las URLs de miniaturas cuando el componente se desmonte
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);




  // Eliminar registros
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false); // Modal de confirmación

  const showConfirmDeleteModal = (registro) => {
    setRegistroSeleccionado(registro); // Guardamos el registro a eliminar
    setConfirmDeleteVisible(true); // Mostramos el modal de confirmación
  };

  const closeConfirmDeleteModal = () => {
    setConfirmDeleteVisible(false); // Cerramos el modal de confirmación
  };

  const confirmEliminar = () => {
    handleEliminar();  // Ejecutamos la eliminación
    closeConfirmDeleteModal();  // Cerramos el modal de confirmación
  };

  // Función para eliminar el registro
  const handleEliminar = async () => {
    try {
      // Asegurarse de que el registro seleccionado tenga un id
      if (!registroSeleccionado || !registroSeleccionado.id) {
        console.error("Registro no encontrado o ID no válido");
        return;
      }

      // Usar 'doc' para obtener la referencia del documento
      const docRef = doc(db, `${toCamelCase(plantillaSeleccionada)}Form`, registroSeleccionado.id);

      // Eliminar el documento de Firestore
      await deleteDoc(docRef);

      console.log("Registro eliminado correctamente");

      // Eliminar el registro de los registros locales (sin necesidad de recargar desde Firestore)
      setRegistrosFiltrados((prevRegistros) =>
        prevRegistros.filter((registro) => registro.id !== registroSeleccionado.id)
      );

      // Mostrar mensaje de éxito en el modal
      showModal("El registro se eliminó correctamente.", "success");

      // Cerrar el modal de confirmación después de eliminar el registro
      setConfirmDeleteVisible(false);
    } catch (error) {
      console.error("Error al eliminar el documento:", error);

      // Mostrar mensaje de error en el modal
      showModal("Hubo un error al eliminar el registro.", "error");
    }
  };

  // Historial

  useEffect(() => {
    if (registroSeleccionado && !registroSeleccionado.imagenes) {
      setRegistroSeleccionado((prev) => ({
        ...prev,
        imagenes: Array(4).fill(""), // Inicializar con 4 posiciones vacías
      }));
    }
  }, [registroSeleccionado]);


  // Historial auditoria
  const [motivoCambio, setMotivoCambio] = useState(""); // Motivo del cambio
  const [historialVisible, setHistorialVisible] = useState(false); // Controlar la visibilidad del modal de historial
  const [historialRegistros, setHistorialRegistros] = useState([]); // Guardar el historial del registro

  const cargarHistorial = async (registroId) => {
    try {
      const historialSnapshot = await getDocs(
        collection(db, "historialModificaciones")
      );
      // Filtrar por el ID del registro
      const historial = historialSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.registroId === registroId);

      setHistorialRegistros(historial); // Guardar el historial en el estado
      setHistorialVisible(true); // Mostrar el modal
    } catch (error) {
      console.error("Error al cargar el historial:", error);
    }
  };

  const limpiarFiltros = () => {
    setPlantillaSeleccionada(""); // Restablece la plantilla seleccionada
    setFechaInicio(""); // Limpia la fecha de inicio
    setFechaFin(""); // Limpia la fecha de fin
    setValoresFiltro({}); // Limpia los filtros aplicados
    setRegistrosFiltrados([]); // Limpia los registros filtrados
  };

  const [geolocalizacion, setGeolocalizacion] = useState(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeolocalizacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error al obtener la geolocalización:", error)
    );
  }, []);


  const [manualCoordinates, setManualCoordinates] = useState(Array(4).fill(null)); // Para 4 imágenes
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // Índice de imagen para capturar coordenadas
  const [mapModalVisible, setMapModalVisible] = useState(false); // Controlar la visibilidad del modal del mapa

  const handleOpenMapForImage = (index) => {
    setSelectedImageIndex(index); // Establece qué imagen se está editando
    setMapModalVisible(true); // Abre el modal del mapa
  };

  const handleCoordinatesCaptured = (coordinates) => {
    setManualCoordinates((prev) => {
      const updated = [...prev];
      updated[selectedImageIndex] = coordinates; // Guarda las coordenadas para la imagen específica
      return updated;
    });
    setMapModalVisible(false); // Cierra el modal del mapa
  };

  return (
    <div className="min-h-screen container mx-auto xl:px-14 py-2 text-gray-500 mb-10">
      <div className="flex gap-2 items-center justify-between px-5 py-3 text-md">
        {/* Navegación */}
        <div className="flex gap-2 items-center">
          <GoHomeFill style={{ width: 15, height: 15, fill: "#d97706" }} />
          <Link to="#">
            <h1 className="font-medium text-gray-600">Home</h1>
          </Link>
          <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
          <h1 className="font-medium text-amber-600">Ver registros</h1>
        </div>

        {/* Botón de volver */}
        <div className="flex items-center">
          <button className="text-amber-600 text-3xl" onClick={handleGoBack}>
            <IoArrowBackCircle />
          </button>


        </div>
      </div>

      <div className="w-full border-b-2"></div>


      {/* Selección de Plantilla */}
      <div className="flex justify-between items-end mb-8 mt-6">
        <div className="flex items-end gap-4">
          {/* Filtros de Fecha */}
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          </div>
          {plantillas.map((plantilla) => (
            <button
              key={plantilla.id}
              onClick={() => {
                setPlantillaSeleccionada(plantilla.nombre);
                cargarRegistros(plantilla.nombre);
              }}
              className={`px-6 py-2 rounded-md font-semibold shadow-md h-12 ${plantillaSeleccionada === plantilla.nombre
                ? "bg-sky-600 text-white"
                : "bg-gray-200 text-gray-800"
                } hover:bg-sky-700 hover:text-white transition`}
            >
              {plantilla.nombre}
            </button>


          ))}



        </div>

        <div className="flex gap-4">

          {/* Botón de Limpiar Filtros */}
          <button
            onClick={limpiarFiltros}
            className="px-6 py-2 bg-gray-400 text-white font-semibold rounded-md shadow-md hover:bg-gray-400 transition"
          >
            Limpiar Filtros
          </button>

          <InformePDF registros={registrosFiltrados} columnas={obtenerColumnas()} />



        </div>


      </div>

      {/* Filtros dinámicos */}
      {camposFiltrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4  text-xs">
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
            <p className="text-center text-gray-500">Cargando registros...</p>
          ) : registrosFiltrados.length > 0 ? (
            <div className="overflow-x-auto bg-gray-50 rounded-md shadow-lg">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {obtenerColumnas().map((columna, index) => (
                      <th
                        key={index}
                        className={`border border-gray-300 px-4 py-2 text-left text-sm text-gray-700 ${columna === "observaciones" ? "w-1/4" : ""
                          }`}
                        style={columna === "observaciones" ? { width: "300px" } : {}}
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
                      className={`hover:bg-sky-50 transition ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                        }`}
                    >
                      {obtenerColumnas().map((columna, colIndex) => (
                        <td
                          key={colIndex}
                          className={`border px-4 py-2 text-gray-800 ${columna === "observaciones" ? "truncate" : ""
                            }`}
                          style={
                            columna === "observaciones"
                              ? { width: "300px", whiteSpace: "normal", wordBreak: "break-word" }
                              : {}
                          }
                        >
                          {registro[columna] || ""}
                        </td>
                      ))}
                      {/* Columna de acciones */}
                      <td className="p-4 text-gray-800 flex gap-2 items-center">
                        <button
                          className="p-2 bg-teal-500 text-white font-bold text-xl rounded-md mr-2"
                          onClick={() => {
                            setRegistroAnterior({ ...registro });
                            setRegistroSeleccionado(registro);
                            setModalContent("Editar");
                            setModalVisible(true);
                          }}
                        >
                          <CiEdit />
                        </button>

                        <button
                          className="p-2 bg-red-400 text-xl text-white rounded-md"
                          onClick={() => showConfirmDeleteModal(registro)}
                        >
                          <MdDelete />
                        </button>

                        <button
                          className="p-2 bg-gray-400 text-xl text-white rounded-md ms-2"
                          onClick={() => cargarHistorial(registro.id)}
                        >
                          <MdOutlineHistoryToggleOff />
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

      {/* Mensaje de texto si no se ha seleccionado una plantilla */}
      {!plantillaSeleccionada || !fechaInicio || !fechaFin ? (
        <p className="text-center text-gray-500 text-xl mt-20">
          Por favor, selecciona una plantilla y un rango de fechas para cargar los registros.
        </p>
      ) : null}


      {modalVisible && modalContent === "Editar" && registroSeleccionado && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-center">Editar Registro</h2>

            {/* Mostrar campos del registro */}
            {Object.keys(registroSeleccionado)
              .filter((campo) => campo !== "imagenes" && campo !== "id") // Excluir las imágenes y el ID
              .map((campo, index) => {
                const campoDinamico = camposFiltrados.find(
                  (c) => c.nombre.toLowerCase() === campo.toLowerCase()
                );

                return (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">
                      {capitalizeFirstLetter(campo)}
                    </label>

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

            {/* Mostrar las imágenes seleccionadas como miniaturas */}
            <div className="flex flex-col gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col items-start">
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Imagen {index + 1}
                  </label>
                  {registroSeleccionado?.imagenes?.[index] || imagePreviews[index] ? (
                    <img
                      src={
                        imagePreviews[index] || registroSeleccionado?.imagenes?.[index] || ""
                      }
                      alt={`Imagen ${index + 1}`}
                      className="w-24 h-24 object-cover mb-2 border border-gray-300 rounded"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-400 mb-2">
                      Sin imagen
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, index)}
                    className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sky-100 file:text-blue-600 hover:file:bg-sky-200"
                  />
                  {/* Botón para abrir el mapa */}
                  <button
                    className="px-2 py-2 text-gray-500 rounded-md mt-2 text-xs underline font-light"
                    onClick={() => handleOpenMapForImage(index)}
                  >
                    Geolocalización manual
                  </button>

                  {/* Mostrar coordenadas seleccionadas
                  {manualCoordinates[index] && (
                    <p className="text-sm text-gray-600 mt-2">
                      Coordenadas: Lat {manualCoordinates[index]?.lat}, Lng {manualCoordinates[index]?.lng}
                    </p>
                  )} */}
                  {mapModalVisible && (
                    <MapWithButton onCoordinatesCaptured={handleCoordinatesCaptured} />
                  )}

                </div>
              ))}
            </div>

            {/* Campo para ingresar el motivo del cambio */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-600 mt-6 mb-4">
                Motivo del cambio
              </label>
              <textarea
                value={motivoCambio}
                onChange={(e) => setMotivoCambio(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                placeholder="Escribe el motivo de la modificación"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                className="px-4 py-2 mr-4 bg-sky-500 text-white rounded-md hover:bg-sky-700 hover_text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                onClick={handleGuardar} // Llama a la función de guardado
                disabled={!motivoCambio.trim()} // Deshabilita el botón si el campo está vacío
              >
                Guardar
              </button>

              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                onClick={() => {
                  setModalVisible(false);
                  setMotivoCambio(""); // Resetea el campo motivoCambio si se cancela
                }}
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
            <h2 className="text-lg font-bold mb-4 text-center">
              {modalType === "success" ? "¡Éxito!" : "Error"}
            </h2>
            <p className="text-sm text-center text-gray-600 mb-4">{alertMessage}</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-sky-500 text-white rounded-md"
                onClick={() => setAlertModalVisible(false)} // Close the modal
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h2 className="text-lg font-bold text-center">¿Estás seguro de que deseas eliminar este registro?</h2>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={confirmEliminar} // Llamamos a la función de confirmar eliminación
              >
                Sí, Eliminar
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={closeConfirmDeleteModal} // Cierra el modal de confirmación
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {historialVisible && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-[90vw] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-6 text-center text-gray-700">Historial de cambios</h2>
            {historialRegistros.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm border-collapse shadow-lg rounded-lg">
                  <thead>
                    <tr className="bg-gray-200 text-gray-700">
                      <th className="border-b px-6 py-3 text-left font-semibold">Fecha y Hora</th>
                      <th className="border-b px-6 py-3 text-left font-semibold">Responsable</th>
                      <th className="border-b px-6 py-3 text-left font-semibold">Motivo del Cambio</th>
                      <th className="border-b px-6 py-3 text-left font-semibold">Campo</th>
                      <th className="border-b px-6 py-3 text-left font-semibold">Valor Anterior</th>
                      <th className="border-b px-6 py-3 text-left font-semibold">Valor Nuevo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialRegistros.map((historial, index) => {
                      const camposModificados = Object.keys(historial.registroAnterior || {}).filter(
                        (campo) => campo !== "id" // Excluir el campo "id"
                      );
                      return camposModificados.map((campo, i) => (
                        <tr
                          key={`${index}-${i}`}
                          className={`hover:bg-gray-100 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                        >
                          {i === 0 && (
                            <>
                              <td
                                className="border-b px-6 py-4 text-gray-600 align-top"
                                rowSpan={camposModificados.length}
                              >
                                {new Date(historial.fechaHora).toLocaleString()}
                              </td>
                              <td
                                className="border-b px-6 py-4 text-gray-600 align-top"
                                rowSpan={camposModificados.length}
                              >
                                {historial.responsable}
                              </td>
                              <td
                                className="border-b px-6 py-4 text-gray-600 align-top"
                                rowSpan={camposModificados.length}
                              >
                                {historial.motivoCambio}
                              </td>
                            </>
                          )}
                          <td className="border-b px-6 py-4 text-gray-600">{campo}</td>
                          <td className="border-b px-6 py-4 text-gray-600">
                            {Array.isArray(historial.registroAnterior[campo])
                              ? historial.registroAnterior[campo].map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline block"
                                >
                                  Ver Imagen {index + 1}
                                </a>
                              ))
                              : typeof historial.registroAnterior[campo] === "string" &&
                                historial.registroAnterior[campo].startsWith("http") ? (
                                <a
                                  href={historial.registroAnterior[campo]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  Ver Imagen
                                </a>
                              ) : (
                                historial.registroAnterior[campo] || "—"
                              )}
                          </td>
                          <td className="border-b px-6 py-4 text-gray-600">
                            {Array.isArray(historial.registroNuevo[campo])
                              ? historial.registroNuevo[campo].map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline block"
                                >
                                  Ver Imagen {index + 1}
                                </a>
                              ))
                              : typeof historial.registroNuevo[campo] === "string" &&
                                historial.registroNuevo[campo].startsWith("http") ? (
                                <a
                                  href={historial.registroNuevo[campo]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  Ver Imagen
                                </a>
                              ) : (
                                historial.registroNuevo[campo] || "—"
                              )}
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-600">No hay historial de cambios para este registro.</p>
            )}
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                onClick={() => setHistorialVisible(false)} // Cerrar el modal
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}










    </div>



  );
};

export default TablaRegistros;
