import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { storage } from "../../../firebase_config.js";
import { ref, uploadBytes, getDownloadURL, } from "firebase/storage";
import { db } from "../../../firebase_config.js";
import InformeRegistros from "./InformeRegistros.jsx";
import imageCompression from "browser-image-compression";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { AiFillLock, AiOutlineClose, AiOutlineCheck } from "react-icons/ai"; // Icono de candado y botones
import { FiCamera } from "react-icons/fi"; // Icono de cámara
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineError } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";
import { FaSignature } from "react-icons/fa";
import { MdOutlineHistory } from "react-icons/md";
import { v4 as uuidv4 } from 'uuid';

import { GoHomeFill } from "react-icons/go";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext.jsx";
import useUsuario from "../../Hooks/useUsuario.jsx"
import ModalFechaVisita from "./ComponentesInforme/ModalFechaVisita.jsx";
import Firma from "../../Components/Firma/Firma.jsx";
import InformeFinal from "./InformeFinal.jsx";
import ListaInformesModal from "./ListaInformesModal.jsx";
import InformeRegistrosActas from "./InformeRegistrosActas.jsx";

const TablaRegistrosActaReunion = () => {
  const uniqueId = uuidv4();
  const { user } = useAuth();
  const userId = user?.uid; // Asegúrate de que 'uid' existe
  const { usuario } = useUsuario(userId)
  const roleUsuario = usuario?.role
  const [nombreUsuario, setNombreUsuario] = useState("");
  const selectedProjectName = localStorage.getItem("selectedProjectName");
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const [registrosParteDeObra, setRegistrosParteDeObra] = useState([]);
  const [columnas, setColumnas] = useState([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
  const [registroAEliminar, setRegistroAEliminar] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [valoresFiltro, setValoresFiltro] = useState({
    sectorNombre: "",
    subSectorNombre: "",
    parteNombre: "",
    elementoNombre: "",
    nombre: "",
  });
  const [valoresUnicos, setValoresUnicos] = useState({
    sectorNombre: [],
    subSectorNombre: [],
    parteNombre: [],
    elementoNombre: [],
    nombre: [],
  });
  const [datosVisita, setDatosVisita] = useState({
    fechaVisita: "",
    hora: "",
    visitaNumero: "",
  });

  const [isFirmaModalOpen, setIsFirmaModalOpen] = useState(false); // Estado para abrir/cerrar el modal
  const [tipoFirma, setTipoFirma] = useState(null); // Almacena si es "empresa" o "cliente"
  const [registroSeleccionado, setRegistroSeleccionado] = useState(null); // Guarda el registro que se firmará
  const [firmaEmpresa, setFirmaEmpresa] = useState(null);
  const [firmaCliente, setFirmaCliente] = useState(null);
  const [modalFirma, setModalFirma] = useState(false)
  const [modalFirmaMensaje, setModalFirmaMensaje] = useState(false)


  const handleAbrirModalFirma = async (registro) => {
    try {
      const docRef = doc(db, "registrosActasDeReunion", registro.id);
      const docSnap = await getDoc(docRef);



      if (docSnap.exists()) {
        const data = docSnap.data();

        // Si ya tiene ambas firmas, mostrar mensaje y evitar firmar
        if (data.firmaEmpresa && data.firmaCliente) {
          setModalFirma(true)
          setModalFirmaMensaje("Este registro ya ha sido firmado.");
          return;
        }

        // Si solo tiene una firma, mostrar el estado actual
        setFirmaEmpresa(data.firmaEmpresa || null);
        setFirmaCliente(data.firmaCliente || null);
      }

      // Permitir abrir el modal si aún se puede firmar
      setRegistroSeleccionado(registro);
      setIsFirmaModalOpen(true);

    } catch (error) {
      console.error("Error al verificar la firma:", error);
    }
  };

  const saveFirmaFirestore = async (firmaURL, registroId) => {
    if (!registroId) return;

    try {
      const docRef = doc(db, "registrosActasDeReunion", registroId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Guardar la firma en Firestore
        const campoFirma = tipoFirma === "empresa" ? "firmaEmpresa" : "firmaCliente";
        await updateDoc(docRef, { [campoFirma]: firmaURL });

        // 🔹 **Actualiza el estado localmente**
        setRegistrosParteDeObra((prev) =>
          prev.map((registro) =>
            registro.id === registroId ? { ...registro, [campoFirma]: firmaURL } : registro
          )
        );

        setRegistrosFiltrados((prev) =>
          prev.map((registro) =>
            registro.id === registroId ? { ...registro, [campoFirma]: firmaURL } : registro
          )
        );

        // Cerrar el modal después de 3 segundos
        setTimeout(() => {
          setIsFirmaModalOpen(false);
          setRegistroSeleccionado(null);
          setTipoFirma(null);
        }, 2000);
      }
    } catch (error) {
      console.error("Error al guardar la firma:", error);
    }
  };


  const handleSelectFirma = (tipo) => {
    setTipoFirma(tipo);
    setIsFirmaModalOpen(false);
  };

  const handleCloseFirmaModal = () => {
    setIsFirmaModalOpen(false); // Cierra el modal
    setRegistroSeleccionado(null); // Limpia el registro seleccionado
    setTipoFirma(null); // Restablece el tipo de firma
  };







  const handleGuardarVisita = (datos) => {
    setDatosVisita(datos);
  };

  const fechaHora = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const fileName = `${selectedProjectName}_${fechaHora}`

  const obtenerFechaActual = () => {
    const hoy = new Date();
    return hoy.toISOString().split("T")[0]; // Formato YYYY-MM-DD
  };


  useEffect(() => {
    const actualizarValoresUnicos = () => {
      const nuevosValoresUnicos = {
        sectorNombre: [...new Set(registrosParteDeObra.map((reg) => reg.sectorNombre || ""))],
        subSectorNombre: [
          ...new Set(
            registrosParteDeObra
              .filter((reg) => !valoresFiltro.sectorNombre || reg.sectorNombre === valoresFiltro.sectorNombre)
              .map((reg) => reg.subSectorNombre || "")
          ),
        ],
        parteNombre: [
          ...new Set(
            registrosParteDeObra
              .filter(
                (reg) =>
                  (!valoresFiltro.sectorNombre || reg.sectorNombre === valoresFiltro.sectorNombre) &&
                  (!valoresFiltro.subSectorNombre || reg.subSectorNombre === valoresFiltro.subSectorNombre)
              )
              .map((reg) => reg.parteNombre || "")
          ),
        ],
        elementoNombre: [
          ...new Set(
            registrosParteDeObra
              .filter(
                (reg) =>
                  (!valoresFiltro.sectorNombre || reg.sectorNombre === valoresFiltro.sectorNombre) &&
                  (!valoresFiltro.subSectorNombre || reg.subSectorNombre === valoresFiltro.subSectorNombre) &&
                  (!valoresFiltro.parteNombre || reg.parteNombre === valoresFiltro.parteNombre)
              )
              .map((reg) => reg.elementoNombre || "")
          ),
        ],
        nombre: [
          ...new Set(
            registrosParteDeObra
              .filter(
                (reg) =>
                  (!valoresFiltro.sectorNombre || reg.sectorNombre === valoresFiltro.sectorNombre) &&
                  (!valoresFiltro.subSectorNombre || reg.subSectorNombre === valoresFiltro.subSectorNombre) &&
                  (!valoresFiltro.parteNombre || reg.parteNombre === valoresFiltro.parteNombre) &&
                  (!valoresFiltro.elementoNombre || reg.elementoNombre === valoresFiltro.elementoNombre)
              )
              .flatMap((reg) =>
                (reg.nombre || "").split(/[,|\-\/]+/).map((actividad) => actividad.trim())
              ) // Divide y limpia las actividades relacionadas
          ),
        ],
      };

      setValoresUnicos(nuevosValoresUnicos);
    };

    actualizarValoresUnicos();
  }, [valoresFiltro, registrosParteDeObra]);


  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setValoresFiltro((prev) => ({
      ...prev,
      [name]: value, // Actualiza el filtro seleccionado
    }));
  };


  // useEffect para obtener el nombre del usuario al cargar el componente
  useEffect(() => {
    const fetchNombreUsuario = async (userId) => {
      try {
        const userDocRef = doc(db, "usuarios", userId); // Ruta en Firestore: 'usuarios/{uid}'
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(userData)
          setNombreUsuario(userData.nombre || 'Sin nombre')
          console.log(userData.nombre)
        } else {
          console.error(`No se encontró un usuario con UID: ${userId}`);
          return "Usuario desconocido";
        }
      } catch (error) {
        console.error("Error al obtener el nombre del usuario:", error);
        return "Error al obtener nombre";
      }
    };

    fetchNombreUsuario(userId); // Llama a la función para obtener el nombre
  }, [userId]); // Solo se ejecuta si userId cambia

  useEffect(() => {
    const fetchRegistrosParteDeObra = async () => {
      try {
        const selectedProjectId = localStorage.getItem("selectedProjectId"); // Obtén el ID del proyecto del localStorage

        if (!selectedProjectId) {
          console.error("No se encontró un 'selectedProjectId' en el localStorage");
          return;
        }

        // Realiza la consulta a Firestore
        const registrosSnapshot = await getDocs(collection(db, "registrosActasDeReunion"));
        const registros = registrosSnapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id, // ID del documento
            ...docSnapshot.data(),
          }))
          .filter((registro) => registro.idProyecto === selectedProjectId); // Filtrar por idProyecto

        if (registros.length > 0) {
          // Obtener columnas dinámicas excluyendo ID e imágenes
          const columnasDinamicas = Object.keys(registros[0])
            .filter(
              (columna) =>
                !columna.toLowerCase().includes("id") &&
                !columna.toLowerCase().includes("imagen")
            )
            .sort((a, b) => a.localeCompare(b));

          // Ordenamos columnas, asegurando que "fechahora" aparezca primero
          const columnasOrdenadas = [
            ...columnasDinamicas.filter((col) => col.toLowerCase() === "fechahora"),
            ...columnasDinamicas.filter((col) => col.toLowerCase() !== "fechahora"),
          ];

          setColumnas(columnasOrdenadas);

          // Obtener valores únicos de cada columna para los filtros
          const valoresUnicos = columnasOrdenadas.reduce((acc, columna) => {
            acc[columna] = [...new Set(registros.map((registro) => registro[columna] || ""))];
            return acc;
          }, {});

          // Configurar filtros iniciales con valores únicos
          setValoresFiltro(
            columnasOrdenadas.reduce((acc, columna) => {
              acc[columna] = "";
              return acc;
            }, {})
          );

          setValoresUnicos(valoresUnicos); // Guardamos valores únicos para desplegables
        }

        setRegistrosParteDeObra(registros);
        setRegistrosFiltrados(registros);
      } catch (error) {
        console.error("Error al obtener registrosParteDeObra:", error);
      }
    };

    fetchRegistrosParteDeObra();
  }, []);



  useEffect(() => {
    const registrosFiltrados = registrosParteDeObra.filter((registro) => {
      const fechaRegistro = new Date(registro.fechaHora).toISOString().split("T")[0]; // Convertir fecha a YYYY-MM-DD

      // ✅ Si NO hay filtro de fecha, no se filtra por fecha
      const cumpleFecha =
        (!valoresFiltro.fechaInicio || fechaRegistro >= valoresFiltro.fechaInicio) &&
        (!valoresFiltro.fechaFin || fechaRegistro <= valoresFiltro.fechaFin);

      // ✅ Aplicar otros filtros
      const cumpleOtrosFiltros = Object.keys(valoresFiltro).every((campo) => {
        if (campo === "fechaInicio" || campo === "fechaFin") return true;
        return !valoresFiltro[campo] || (registro[campo] || "").includes(valoresFiltro[campo]);
      });

      return cumpleFecha && cumpleOtrosFiltros;
    });

    setRegistrosFiltrados(registrosFiltrados);
  }, [valoresFiltro, registrosParteDeObra]);






  const handleEliminarRegistro = async () => {
    console.log(registroAEliminar)
    try {
      if (registroAEliminar) {
        // Eliminar el documento usando su ID en Firestore
        await deleteDoc(doc(db, "registrosActasDeReunion", registroAEliminar.id));

        // Actualizar el estado local para eliminar el registro eliminado
        setRegistrosParteDeObra((prev) =>
          prev.filter((registro) => registro.id !== registroAEliminar.id)
        );
        setRegistrosFiltrados((prev) =>
          prev.filter((registro) => registro.id !== registroAEliminar.id)
        );

        // Cerrar el modal de confirmación
        setShowConfirmModal(false);
        setRegistroAEliminar(null);
      }
    } catch (error) {
      console.error("Error al eliminar el registro:", error);
    }
  };


  // Estado para almacenar las imágenes seleccionadas y sus previsualizaciones
  const [imagenesEditadas, setImagenesEditadas] = useState(new Array(6).fill(null));
  const [previsualizaciones, setPrevisualizaciones] = useState(new Array(6).fill(null));


  // Estado para el registro que se está editando
  const [registroEditando, setRegistroEditando] = useState(null);
  // Estado para almacenar el registro que se está editando

  // Estado para abrir/cerrar el modal de edición
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);

  const handleSeleccionarImagen = async (e, index) => {
    const file = e.target.files[0]; // Obtener la imagen seleccionada
    if (!file) return;

    try {
      // Comprimir la imagen
      const imagenComprimida = await comprimirImagen(file);

      // Crear URL temporal para previsualizar la imagen comprimida
      const imageUrl = URL.createObjectURL(imagenComprimida);
      setPrevisualizaciones((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = imageUrl;
        return newPreviews;
      });

      // Guardar la imagen comprimida en el estado para procesarla después
      setImagenesEditadas((prev) => {
        const updatedImages = [...prev];
        updatedImages[index] = imagenComprimida;
        return updatedImages;
      });
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
    }
  };

  const handleGuardarEdicion = async () => {
    try {
      if (!registroEditando) return;

      const docRef = doc(db, "registrosActasDeReunion", registroEditando.id);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        console.error("El documento no existe en Firestore.");
        return;
      }

      const registroOriginal = docSnapshot.data(); // Datos actuales antes de la edición

      // 🔍 LOG 1: Mostrar imágenes anteriores
      console.log("🖼️ Imágenes ANTERIORES del registro:", registroOriginal.imagenes);

      // Procesar las imágenes nuevas o mantener las anteriores
      let nuevasUrls = [];

      for (let i = 0; i < 6; i++) {
        const nuevaImg = imagenesEditadas[i];
        if (nuevaImg) {
          const url = await subirImagenConMetadatos(nuevaImg, i);
          nuevasUrls[i] = url;
        } else {
          nuevasUrls[i] = registroOriginal.imagenes?.[i] || null;
        }
      }

      // 🔍 LOG 2: Mostrar las imágenes actualizadas
      console.log("✅ Imágenes ACTUALIZADAS que se guardarán:", nuevasUrls);

      // Crear objeto actualizado
      const registroActualizado = {
        ...registroEditando,
        actividades: registroEditando.actividades,
        imagenes: nuevasUrls,
      };

      // Guardar cambios
      await updateDoc(docRef, registroActualizado);

      // Guardar historial
      const historialRef = collection(db, "historialRegistrosActasDeReunion");
      await addDoc(historialRef, {
        registroId: registroEditando.id,
        fechaHora: new Date().toISOString(),
        responsable: nombreUsuario,
        motivoCambio: motivoCambio || "Sin motivo",
        registroOriginal,
        registroEditado: registroActualizado,
      });

      // Actualizar estados en frontend
      setRegistrosParteDeObra((prev) =>
        prev.map((registro) =>
          registro.id === registroEditando.id ? registroActualizado : registro
        )
      );

      setRegistrosFiltrados((prev) =>
        prev.map((registro) =>
          registro.id === registroEditando.id ? registroActualizado : registro
        )
      );

      // Cerrar modal
      setModalEdicionAbierto(false);
      setRegistroEditando(null);
      setMotivoCambio("");
    } catch (error) {
      console.error("❌ Error al guardar los cambios:", error);
    }
  };







  // Comprimir la imagen antes de
  const comprimirImagen = async (file) => {
    try {
      const opciones = {
        maxSizeMB: 0.3, // Tamaño máximo de la imagen (en MB)
        maxWidthOrHeight: 1920, // Dimensiones máximas
        useWebWorker: true, // Usa WebWorker para no bloquear la UI
      };

      const imagenComprimida = await imageCompression(file, opciones);
      return imagenComprimida;
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      return file; // Si falla, devuelve la imagen original
    }
  };

  const subirImagenConMetadatos = async (file, index) => {
    try {
      const loteNombre = registroEditando?.parteNombre || "SinNombreLote";
      const fechaActual = new Date().toISOString().split("T")[0];
      const uniqueId = uuidv4();

      const fileName = `${selectedProjectName}_${loteNombre}_${fechaActual}_${uniqueId}_${index}.jpg`
        .replace(/[/\\?%*:|"<>]/g, "");

      const storagePath = `imagenes/${selectedProjectName}/${loteNombre}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      const metadata = {
        contentType: file.type,
        customMetadata: {
          latitude: "", // puedes agregar coords si las capturas al editar
          longitude: "",
          proyecto: selectedProjectName,
          lote: loteNombre,
          fecha: fechaActual,
        },
      };

      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      return null;
    }
  };



  const handleGoBack = () => {
    navigate(-1); // Navega hacia atrás en el historial
  };


  const [modalOpen, setModalOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState("");

  const openModal = (observation) => {
    setSelectedObservation(observation);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedObservation("");
  };

  // Limpiar filtros
  const resetFilters = () => {
    // Restablece los filtros a su estado inicial (todos los valores vacíos)
    setValoresFiltro((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = ""; // Limpia cada filtro
        return acc;
      }, {})
    );

    console.log("Filtros restablecidos"); // Para verificar en consola
  };

  // Historial de cambios

  const [motivoCambio, setMotivoCambio] = useState("");
  const [modalModificacionesAbierto, setModalModificacionesAbierto] = useState(false);
  const [historialModificaciones, setHistorialModificaciones] = useState([]);

  const handleAbrirModalModificaciones = async (registro) => {
    try {
      // Consulta a la colección de historial
      const historialSnapshot = await getDocs(
        collection(db, "historialRegistrosActasDeReunion")
      );

      // Filtrar los cambios asociados al registro seleccionado
      const historial = historialSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.registroId === registro.id);

      setHistorialModificaciones(historial);
      setModalModificacionesAbierto(true); // Abre el modal
    } catch (error) {
      console.error("Error al cargar el historial de modificaciones:", error);
    }
  };



  const columnasMap = {
    fechaHora: "Fecha y hora",
    sectorNombre: "Grupo activos",
    subSectorNombre: "Activo",
    parteNombre: "Inventario vial",
    elementoNombre: "Sector",
    nombre: "Actividad",
    actividad: "Actividad", // Nuevo mapeo para la columna actividad
    observaciones: "Observaciones",
  };

  // Orden específico de las columnas
  const ordenColumnas = [
    "fechaHora",
    "sectorNombre",
    "subSectorNombre",
    "parteNombre",
    "elementoNombre",
    "nombre",
    "actividad",
    "observaciones",
  ];

  const formatFecha = (fecha) => {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaObj.getFullYear();
    const horas = fechaObj.getHours().toString().padStart(2, "0");
    const minutos = fechaObj.getMinutes().toString().padStart(2, "0");
    const segundos = fechaObj.getSeconds().toString().padStart(2, "0");

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  };

  const formatFechaActual = () => {
    const hoy = new Date();
    return `${hoy.getDate().toString().padStart(2, "0")}/${(hoy.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${hoy.getFullYear()}`;
  };

  const formatFechaSolo = (fecha) => {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`; // Devuelve solo DD/MM/YYYY
  };

  const formatCamelCase = (text) => {
    return text
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Separa camelCase en palabras
      .replace(/\b[a-z]/g, (c) => c.toUpperCase()); // Capitaliza cada palabra
  };

  // generar informe del registro
  const [dataRegister, setDataRegister] = useState({})

  const handleGeneratePdfRegistro = (registro) => {
    const registroActualizado = registrosParteDeObra.find(r => r.id === registro.id);
    setDataRegister(registroActualizado || registro);
  };
  return (
    <div className="container mx-auto xl:px-14 py-2 text-gray-500 mb-10 min-h-screen">
      <div className="flex md:flex-row flex-col gap-2 items-center justify-between px-5 py-3 text-md">
        {/* Navegación */}
        <div className="flex gap-2 items-center">
          {/* Elementos visibles solo en pantallas medianas (md) en adelante */}
          <GoHomeFill className="hidden md:block" style={{ width: 15, height: 15, fill: "#d97706" }} />
          <Link to="#" className="hidden md:block font-medium text-gray-600">
            Homesss
          </Link>
          <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />
          <h1 className="hidden md:block font-medium">Actas de reunión</h1>
          <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />

          {/* Nombre del proyecto (visible en todas las pantallas) */}
          <h1 className="font-medium text-amber-600 px-2 py-1 rounded-lg">
            {selectedProjectName}
          </h1>
        </div>

        {/* Botón de volver */}
        <div className="flex items-center">
          <button className="text-amber-600 text-3xl" onClick={handleGoBack}>
            <IoArrowBackCircle />
          </button>
        </div>
      </div>

      <div className="w-full border-b-2"></div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-6 mb-2 items-end px-6">
        {/* Fecha Inicial y Fecha Final */}
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2">Fecha Inicial</label>
          <input
            type="date"
            value={valoresFiltro.fechaInicio || ""}
            onChange={(e) => {
              const fechaInicioSeleccionada = e.target.value;
              console.log("Fecha Inicial seleccionada:", fechaInicioSeleccionada);
              setValoresFiltro((prev) => ({ ...prev, fechaInicio: fechaInicioSeleccionada }));
            }}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-2">Fecha Final</label>
          <input
            type="date"
            value={valoresFiltro.fechaFin || ""}
            onChange={(e) => {
              const fechaFinSeleccionada = e.target.value;
              console.log("Fecha Final seleccionada:", fechaFinSeleccionada);
              setValoresFiltro((prev) => ({ ...prev, fechaFin: fechaFinSeleccionada }));
            }}
            className="border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Filtros dinámicos sin "fechaHora" */}
        {ordenColumnas
          .filter((filtro) => filtro !== "observaciones" && filtro !== "fechaHora" && filtro !== "actividad" && filtro !== "sectorNombre" && filtro !== "subSectorNombre" && filtro !== "parteNombre" && filtro !== "elementoNombre") // Excluir "observaciones" si no es necesario
          .map((filtro) => (
            <div key={filtro} className="flex flex-col">
              <label className="font-semibold text-gray-700 mb-2">
                {columnasMap[filtro]}
              </label>
              <select
                name={filtro}
                value={valoresFiltro[filtro] || ""}
                onChange={(e) =>
                  setValoresFiltro((prev) => ({ ...prev, [filtro]: e.target.value }))
                }
                className="border border-gray-300 rounded-md p-2"
              >
                <option value="">Todos</option>
                {valoresUnicos[filtro]?.map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}
                  </option>
                ))}
              </select>
            </div>
          ))}
      </div>


      <div className="flex justify-between px-6 py-4 mb-2 gap-5">
        {/* Botón para borrar filtros */}
        <div className="flex justify-start gap-5 col-span-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 h-12 bg-gray-500 text-white text-sm font-semibold rounded-md hover:bg-gray-600 transition duration-200"
          >
            Limpiar
          </button>
          <InformeFinal
            registros={registrosFiltrados}
            columnas={columnas}
            datosVisita={datosVisita}

            formatFechaActual={formatFechaActual()}
            fechaInicio={formatFechaSolo(valoresFiltro.fechaInicio)}
            fechaFin={formatFechaSolo(valoresFiltro.fechaFin)}
            fileName={fileName}
            nombreUsuario={nombreUsuario}
            selectedProjectName={selectedProjectName}
            selectedProjectId={selectedProjectId}

          />
        </div>



        <ListaInformesModal />


      </div>

      <div className="overflow-x-auto px-6">
        {registrosFiltrados.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            <p className="text-lg font-semibold"> 📂 No se encontraron registros.</p>
          </div>
        ) : (
          <table className="hidden sm:table min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="border-gray-200 bg-sky-600 text-white">
              <tr>
                {ordenColumnas
                  .filter((columna) => columna !== "nombre" && columna !== "sectorNombre" && columna !== "subSectorNombre" && columna !== "elementoNombre" && columna !== "parteNombre")
                  .map((columna) => (
                    <th
                      key={columna}
                      className="text-left px-6 py-3 text-sm font-semibold tracking-wide"
                    >
                      {columnasMap[columna]}
                    </th>
                  ))}
                <th className="text-left px-6 py-3 text-sm font-semibold tracking-wide"></th>
                <th className="text-left px-6 py-3 text-sm font-semibold tracking-wide"></th>
                <th className="text-left px-6 py-3 text-sm font-semibold tracking-wide">Informe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {registrosFiltrados
                .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora)) // Ordenar por fecha descendente
                .map((registro) => (
                  <tr
                    key={registro.id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    {ordenColumnas
                      .filter((columna) => columna !== "nombre" && columna !== "sectorNombre" && columna !== "subSectorNombre" && columna !== "elementoNombre" && columna !== "parteNombre")
                      .map((columna) => (
                        <td
                          key={columna}
                          className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap"
                        >
                          {columna === "fechaHora"
                            ? formatFecha(registro[columna]) // Formato de fecha
                            : columna === "observaciones" ? (
                              <button
                                onClick={() => openModal(registro[columna])}
                                className="text-blue-500 hover:underline"
                              >
                                Ver observaciones
                              </button>
                            ) : columna === "actividad" ? (
                              registro.actividad || "—"
                            ) : (
                              registro[columna] || "—"
                            )}
                        </td>
                      ))}
                    <td className="px-6 py-4 text-sm whitespace-nowrap flex flex-col items-center gap-2">
                      {/* Lógica de progreso aquí */}
                    </td>
                    <td className="px-6 py-4 text-sm w-32"> {/* Fijamos el tamaño a 8rem (32px * 8) */}
                      <div className="flex gap-2 items-center">

                        {/* Botón de Editar */}
                        <button
                          onClick={() => {
                            setRegistroEditando(registro);
                            setModalEdicionAbierto(true);
                            setPrevisualizaciones(registro.imagenes || []);
                            setImagenesEditadas([]);
                          }}
                          className="px-3 py-2 text-gray-500 text-xl font-medium hover:text-sky-700 transition flex items-center"
                        >
                          <FaEdit />
                        </button>

                        {/* Estado de Firma */}
                        <div className="w-28 flex justify-center"> {/* Ancho fijo para alinear */}
                          {registro.firmaEmpresa && registro.firmaCliente ? (
                            <div className="flex items-center gap-2 text-green-700 font-semibold flex flex-col gap-2 items-center">
                              <FaCheck className="text-green-600" /> <span>Firmado</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAbrirModalFirma(registro)}
                              className="px-4 py-2 text-gray-500 text-2xl font-medium hover:text-sky-700 transition flex flex-col gap-2 items-center"
                            >
                              <FaSignature /> <span className="text-xs">Pendiente</span>
                            </button>
                          )}
                        </div>

                        {/* Botón de Historial */}
                        <button
                          onClick={() => handleAbrirModalModificaciones(registro)}
                          className="px-3 py-2 text-gray-500 text-2xl font-medium hover:text-sky-700 transition flex items-center"
                        >
                          <MdOutlineHistory />
                        </button>

                        {/* Botón de Eliminar (solo admin) */}
                        {roleUsuario === "admin" && (
                          <button
                            onClick={() => {
                              setShowConfirmModal(true);
                              setRegistroAEliminar(registro);
                            }}
                            className="px-3 py-2 text-red-700 text-2xl font-medium hover:text-red-800 transition flex items-center"
                          >
                            <FaDeleteLeft />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <InformeRegistrosActas
                        onClick={() => {
                          handleGeneratePdfRegistro(registro);
                          setTimeout(() => {
                            handlegeneratePDF();
                          }, 100);
                        }}
                        registros={registrosFiltrados}
                        columnas={columnas}
                        datosVisita={datosVisita}
                        dataRegister={registro}
                        formatFechaActual={formatFechaActual()}
                        fechaInicio={formatFechaSolo(valoresFiltro.fechaInicio)}
                        fechaFin={formatFechaSolo(valoresFiltro.fechaFin)}
                        fileName={fileName}
                        nombreUsuario={nombreUsuario}
                        selectedProjectName={selectedProjectName}
                      />


                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>


      <div className="overflow-x-auto px-6">
        {/* Vista en modo cards para dispositivos pequeños */}
        <div className="sm:hidden grid gap-4">
          {registrosFiltrados
            .sort((a, b) => {
              // Primero ordenamos por sectorNombre (Grupo activos)
              if (a.sectorNombre < b.sectorNombre) return -1;
              if (a.sectorNombre > b.sectorNombre) return 1;

              // Si el sectorNombre es igual, ordenamos por fechaHora
              const fechaA = new Date(a.fechaHora);
              const fechaB = new Date(b.fechaHora);
              return fechaA - fechaB; // Orden ascendente por fecha
            })
            .map((registro) => (
              <div
                key={registro.id}
                className="bg-gray-200 shadow-lg rounded-lg p-4 border border-gray-200 mt-2"
              >
                {ordenColumnas
                  .filter((filtro) => filtro !== "observaciones" && filtro !== "actividad" && filtro !== "sectorNombre" && filtro !== "subSectorNombre" && filtro !== "parteNombre")
                  .map((columna) => (
                    <div key={columna} className="mb-2">
                      <span className="font-semibold text-gray-700 block">
                        {columnasMap[columna]}:
                      </span>
                      <span className="text-gray-600">
                        {columna === "fechaHora" ? (
                          formatFecha(registro[columna]) // Aplicar formato a la fecha
                        ) : columna === "observaciones" ? (
                          <button
                            onClick={() => openModal(registro[columna])}
                            className="text-sky-600 hover:underline"
                          >
                            Ver observaciones
                          </button>
                        ) : (
                          registro[columna] || "—"
                        )}
                      </span>
                    </div>
                  ))}


                {/* Acciones */}
                <div className="flex flex-col mt-8">

                  <div className="flex gap-10">
                    <button
                      onClick={() => {
                        setRegistroEditando(registro);
                        setModalEdicionAbierto(true);
                        setPrevisualizaciones(registro.imagenes || []);
                        setImagenesEditadas([]);
                      }}
                      className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md shadow-sm hover:bg-sky-700 transition duration-150 flex gap-2 items-center"
                    >
                      <FaEdit />
                    </button>

                    {/* Botón de Historial */}
                    <button
                      onClick={() => handleAbrirModalModificaciones(registro)}
                      className="px-3 py-2 text-gray-500 text-2xl font-medium hover:text-sky-700 transition flex items-center"
                    >
                      <MdOutlineHistory />
                    </button>

                    {roleUsuario === 'admin' && (
                      <button
                        onClick={() => {
                          setShowConfirmModal(true);
                          setRegistroAEliminar(registro);
                        }}
                        className="px-4 py-2 bg-red-400 text-white font-medium rounded-md shadow-sm hover:bg-red-400 transition duration-150"
                      >
                        <FaDeleteLeft />
                      </button>
                    )
                    }
                  </div>

                  <div className="flex gap-8 mt-8">
                    {/* Estado de Firma */}
                    <div className="flex justify-start"> {/* Ancho fijo para alinear */}
                      {registro.firmaEmpresa && registro.firmaCliente ? (
                        <div className="flex items-center gap-2 text-green-700 font-semibold flex gap-2 items-center">
                          <FaCheck className="text-green-600" /> <span>Firmado</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAbrirModalFirma(registro)}
                          className="px-4 py-2 text-gray-500 text-2xl font-medium hover:text-sky-700 transition flex flex-col gap-2 items-center"
                        >
                          <FaSignature /> <span className="text-xs">Pendiente</span>
                        </button>
                      )}
                    </div>

                    <InformeRegistros
                      onClick={() => {
                        handleGeneratePdfRegistro(registro);
                        setTimeout(() => {
                          handlegeneratePDF();
                        }, 100);
                      }}
                      registros={registrosFiltrados}
                      columnas={columnas}
                      datosVisita={datosVisita}
                      dataRegister={registro}
                      formatFechaActual={formatFechaActual()}
                      fechaInicio={formatFechaSolo(valoresFiltro.fechaInicio)}
                      fechaFin={formatFechaSolo(valoresFiltro.fechaFin)}
                      fileName={fileName}
                      nombreUsuario={nombreUsuario}
                      selectedProjectName={selectedProjectName}
                    />

                  </div>


                </div>
              </div>
            ))}

        </div>
      </div>



      {/* Modal para observaciones */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Observaciones</h2>
            <p className="text-gray-600">{selectedObservation}</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}


      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              ¿Estás seguro de que deseas eliminar este registro?
            </h3>
            <div className="flex justify-end gap-4">

              <button
                onClick={handleEliminarRegistro}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      {modalEdicionAbierto && registroEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            {/* Header con icono de cierre */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Editar Registro</h2>

              <button onClick={() => setModalEdicionAbierto(false)} className="text-gray-500 hover:text-gray-700">
                <AiOutlineClose size={24} />
              </button>
            </div>
            <div className="border-b-2 w-full mb-4"></div>

            {Object.keys(registroEditando)
  .filter((campo) =>
    ![
      "imagenes",
      "id",
      "idBim",
      "nombreProyecto",
      "elementoId",
      "idSector",
      "idSubSector",
      "parteId",
      "ppiId",
      "loteId",
      "totalSubactividades",
      "pkFinal",
      "pkInicial",
      "idProyecto",
      "estado",
      "ppiNombre",
      "actividades",
      "sectorNombre",
      "subSectorNombre",
      "parteNombre",
      "elementoNombre",
      "elementoNombre",
      "mediosDisponibles",
      "resumenPuntosControl",
      "firmaCliente",
      "firmaEmpresa",
      "actividad",
      "formType",
      "observaciones",
      "observacionesActividad",
      "observacionesLocalizacion",
      "observacionesActividades",
    ].includes(campo)
  )
  .sort((a, b) => a.localeCompare(b)) // Ordena alfabéticamente
  .map((campo, index) => (
    <div key={index} className="mb-4 tex-xs">  
    </div>
  ))}



            <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">Detalles de la inspección</h3>
            {/* Editar actividades */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 bg-gray-200 p-2 flex gap-2">Actividades<span><AiFillLock className="ml-2 text-gray-500" size={16} /></span></label>
              {Object.entries(registroEditando.actividades || {})
                .filter(([_, actividad]) => !actividad.noAplica)
                .map(([index, actividad]) => (
                  <div
                    key={index}
                    className="mb-3 p-4 border border-gray-300 rounded-lg shadow-sm bg-white"
                  >
                    {/* Información de la actividad */}
                    <div className="flex items-center gap-2 mb-2 text-sm">
                      <p className="font-semibold text-gray-800">{actividad.numero || index}-</p>
                      <p className="font-semibold text-gray-800">
                        {actividad.nombre || "Actividad sin nombre"}
                      </p>
                    </div>

                    {/* Estado de la actividad (Cumple, No cumple, No aplica) */}
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
                      {/* "Cumple" solo si NO está en "No Aplica" */}
                      <span className={`min-w-[90px] flex items-center justify-center px-3 py-1 
    ${actividad.noAplica ? "text-gray-400" : actividad.seleccionada === true ? "text-gray-800 font-bold bg-gray-200 border rounded-md" : "text-gray-500"}`}>
                        ✅ Aplica
                      </span>



                      {/* "No Aplica" siempre se muestra */}
                      <span className={`min-w-[90px] flex items-center justify-center px-3 py-1 
    ${actividad.noAplica ? "text-gray-800 font-bold bg-gray-200 border rounded-md" : "text-gray-500"}`}>
                        ⚪ No Aplica
                      </span>
                    </div>


                   
                  </div>
                ))}

            </div>


            



            
          
            {/* Motivo del cambio
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1 bg-gray-200 p-2">Motivo del cambio</label>
              <textarea
                value={motivoCambio}
                onChange={(e) => setMotivoCambio(e.target.value)}
                placeholder="Describe el motivo de este cambio"
                className="w-full px-4 py-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                required
              />
            </div> */}

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 mt-6">
              {/* Botón de Cancelar */}
              <button
                className="px-5 py-2 text-gray-700 font-semibold bg-gray-200 rounded-md hover:bg-gray-300 transition flex items-center gap-2"
                onClick={() => setModalEdicionAbierto(false)} // Lógica para cerrar el modal
              >
                <AiOutlineClose size={18} /> Cancelar
              </button>

              {/* Botón de Guardar Cambios */}
              <button
                className={`px-5 py-2 font-semibold rounded-md transition flex items-center gap-2 ${motivoCambio.trim()
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-500 text-gray-200 cursor-not-allowed"
                  }`}
                onClick={handleGuardarEdicion}
                disabled={!motivoCambio.trim()} // Deshabilita si no hay motivo
              >
                <AiOutlineCheck size={18} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}



      {modalModificacionesAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">

            {/* Header del modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Historial de Modificaciones</h2>
              <button
                onClick={() => setModalModificacionesAbierto(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineClose size={24} />
              </button>
            </div>

            {/* Tabla Comparativa */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] border rounded-lg">
              <table className="min-w-full bg-white shadow-lg">
                <thead className="bg-sky-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Fecha</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Responsable</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Motivo</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Estado Original</th>
                    <th className="px-4 py-3 text-sm font-semibold text-center">Estado Editado</th>
                  </tr>
                </thead>
                <tbody>
                  {historialModificaciones.map((modificacion, index) => (
                    <tr
                      key={modificacion.id || index}
                      className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      {/* Fecha */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {new Date(modificacion.fechaHora).toLocaleString()}
                      </td>

                      {/* Responsable */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {modificacion.responsable}
                      </td>

                      {/* Motivo */}
                      <td className="px-4 py-3 text-sm text-gray-700 text-center">
                        {modificacion.motivoCambio}
                      </td>

                      {/* Estado Original */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <ul className="space-y-1">
                          {Object.entries(modificacion.registroOriginal || {})
                            .filter(([key]) => ["imagenes", "observaciones"].includes(key)) // 🔥 Solo mostrar imágenes y observaciones
                            .map(([key, value]) => (
                              <li key={key}>
                                <strong>{formatCamelCase(key)}:</strong>{" "}

                                {/* Imágenes como enlaces clickeables */}
                                {key === "imagenes" && Array.isArray(value) ? (
                                  value.map((url, i) => (
                                    <div key={i}>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                      >
                                        Imagen {i + 1}
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  value
                                )}
                              </li>
                            ))}
                        </ul>
                      </td>


                      {/* Estado Editado */}
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <ul className="space-y-1">
                          {Object.entries(modificacion.registroEditado || {})
                            .filter(([key]) => ["imagenes", "observaciones"].includes(key)) // 🔥 Solo mostrar imágenes y observaciones
                            .map(([key, value]) => (
                              <li key={key}>
                                <strong>{formatCamelCase(key)}:</strong>{" "}

                                {/* Imágenes como enlaces clickeables */}
                                {key === "imagenes" && Array.isArray(value) ? (
                                  value.map((url, i) => (
                                    <div key={i}>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                      >
                                        Imagen {i + 1}
                                      </a>
                                    </div>
                                  ))
                                ) : (
                                  value
                                )}
                              </li>
                            ))}
                        </ul>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isFirmaModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-2xl text-center border-t-4 relative">

            {/* Botón de Cerrar */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
              onClick={() => setIsFirmaModalOpen(false)}
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-gray-700 mb-5 flex justify-center items-center gap-2">
              🖋 Estado de Firmas
            </h2>

            {firmaEmpresa && firmaCliente ? (
              // ✅ Registro completamente firmado
              <div className="flex flex-col items-center">
                <div className="bg-green-100 text-green-700 p-4 rounded-full text-3xl">
                  ✔️
                </div>
                <p className="text-green-700 font-semibold text-lg mt-4">Registro Firmado ✅</p>
                <p className="text-gray-600 text-sm mt-1">No se requieren más acciones.</p>
              </div>
            ) : (
              <>
                {/* Estado de las firmas */}
                <div className="flex flex-col gap-3 mb-6 text-sm">
                  <div className={`flex items-center gap-3 p-3  border-b-2 ${firmaEmpresa ? "border-green-500 bg-green-100" : "border-gray-300"}`}>
                    <span className="text-2xl">{firmaEmpresa ? "📑" : "🟡"}</span>
                    <p className="font-semibold">{firmaEmpresa ? "Firma coordinador registrada" : "Pendiente Firma coordinador"}</p>
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${firmaCliente ? "border-green-500 bg-green-100" : "border-gray-300"}`}>
                    <span className="text-2xl">{firmaCliente ? "🏢" : "🟡"}</span>
                    <p className="font-semibold">{firmaCliente ? "Firma contratista registrada" : "Pendiente Firma contratista"}</p>
                  </div>
                </div>

                {/* Botones de Firma */}
                <div className="flex justify-center gap-4">
                  {/* Botón Firma Empresa */}
                  <button
                    onClick={() => handleSelectFirma("empresa")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${firmaEmpresa
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-sky-700 text-white hover:bg-sky-800"}`
                    }
                    disabled={firmaEmpresa}
                  >
                    Firma coordinador
                  </button>

                  {/* Botón Firma Cliente */}
                  <button
                    onClick={() => handleSelectFirma("cliente")}
                    className={`flex items-center gap-2 px-5 py-2 rounded-md font-semibold transition ${firmaCliente
                      ? "bg-sky-700 text-gray-500 cursor-not-allowed"
                      : "bg-sky-700 text-white hover:bg-sky-800"}`
                    }
                    disabled={firmaCliente}
                  >
                    Firma contratista
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {tipoFirma && registroSeleccionado && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Firma
            onSave={(firmaURL) => saveFirmaFirestore(firmaURL, registroSeleccionado.id)}
            onClose={handleCloseFirmaModal} // Ahora pasamos `onClose`
          />
        </div>
      )}


      {modalFirma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center border-t-4 relative">

            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
              onClick={() => {
                setModalFirma(false)
                setModalFirmaMensaje("")
              }}
            >
              ✖
            </button>

            <h2 className="text-lg font-bold text-gray-700 mb-4">Información</h2>
            <p className="text-gray-600">{modalFirmaMensaje}</p>

            <div className="mt-6">
              <button
                onClick={() => {
                  setModalFirmaMensaje("")
                  setModalFirma(false)
                }}
                className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}









    </div>
  );
};

export default TablaRegistrosActaReunion;
