import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, where, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { IoClose } from "react-icons/io5";
import imageCompression from "browser-image-compression";
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaCheck, FaDeleteLeft } from "react-icons/fa6";
import { MdOutlineError } from "react-icons/md";
import { BsClipboardData } from "react-icons/bs";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import Firma from "../../Components/Firma/Firma";
import VoiceRecorderInput from "./AudioTexto/VoiceRecorderInput";
import { v4 as uuidv4 } from 'uuid';



const ParteObra = () => {
  const uniqueId = uuidv4();
  const navigate = useNavigate();
  const selectedProjectName = localStorage.getItem("selectedProjectName");
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [formData, setFormData] = useState({
    observaciones: "",
    observacionesActividad: "",
    observacionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
    observacionesLocalizacion: "",
    fechaHora: "",
    imagenes: [],
    mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "" }]
  });
  const [activityVisibility, setActivityVisibility] = useState(true); // Estado para controlar la visibilidad de las observaciones

  const fileInputsRefs = useRef([]);
  const [geolocalizacion, setGeolocalizacion] = useState(null);

  const [loteOptions, setLoteOptions] = useState([]);
  const [selectedLoteOption, setSelectedLoteOption] = useState(""); // Opción seleccionada

  // Filtros
  // Crear estados para filtros
  const [filters, setFilters] = useState({
    sector: "",
    subSector: "",
    parte: "",
    elemento: "",
    nombre: ""
  });

  const [uniqueValues, setUniqueValues] = useState({
    sector: [],
    subSector: [],
    parte: [],
    elemento: [],
    nombre: [],
  });

  // Modal
  const [modalSend, setModalSend] = useState(false)
  const [messageModalSend, setMessageModalSend] = useState('')

  // Detalles del PPI
  const [ppiDetails, setPpiDetails] = useState(null); // Estado para almacenar el PPI

  // Estado para almacenar los checkbox seleccionados
  const [selectedSubactivities, setSelectedSubactivities] = useState({});

  const [stats, setStats] = useState({ totalSi: 0, totalNo: 0, totalActividades: 0, porcentajeApto: 0 });
  const [activityObservations, setActivityObservations] = useState({});
  const [errorMessages, setErrorMessages] = useState([]);

  const [observacionesImagenes, setObservacionesImagenes] = useState({});


  const [firma, setFirma] = useState(null);  // Estado para la firma

  const handleSave = () => {
    localStorage.setItem("firma", firma);  // Guardar la firma en localStorage
    setModalOpen(false);
  };

  const handleObservationChange = (actividadIndex, value) => {
    setActivityObservations((prev) => ({
      ...prev,
      [actividadIndex]: value, // Guarda la observación con el índice de la actividad
    }));
  };

  //  medios disponibles
  const handleAddEmpresa = () => {
    setFormData((prev) => ({
      ...prev,
      mediosDisponibles: [...prev.mediosDisponibles, { nombreEmpresa: "", numeroTrabajadores: "" }]
    }));
  };
  const handleRemoveEmpresa = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediosDisponibles: prev.mediosDisponibles.filter((_, i) => i !== index)
    }));
  };

  const handleMediosChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedMedios = [...prev.mediosDisponibles];
      updatedMedios[index][field] = value;
      return { ...prev, mediosDisponibles: updatedMedios };
    });
  };



  const [selectedActivities, setSelectedActivities] = useState({});


  useEffect(() => {
    if (ppiDetails && ppiDetails.actividades) {
      const totalActividadesInicial = ppiDetails.actividades.length;

      // Contar cuántas actividades NO están en "No Aplica"
      const totalActividades = totalActividadesInicial - Object.values(selectedActivities).filter(act => act.noAplica).length;

      const totalSi = Object.values(selectedActivities).filter(act => act.seleccionada === true).length;
      const totalNo = Object.values(selectedActivities).filter(act => act.seleccionada === false).length;

      // Si aún no se han seleccionado actividades, el porcentaje es 0%
      const porcentajeApto = totalActividades > 0 ? Math.round((totalSi / totalActividades) * 100) : 0;

      setStats({ totalSi, totalNo, totalActividades, porcentajeApto, totalActividadesInicial });
    }
  }, [selectedActivities, ppiDetails]);


  // Generar valores únicos al cargar los lotes
  useEffect(() => {
    if (lotes.length > 0) {
      setUniqueValues({
        sector: [...new Set(lotes
          .filter((l) =>
            (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
            (filters.parte === "" || l.parteNombre === filters.parte) &&
            (filters.elemento === "" || l.elementoNombre === filters.elemento) &&
            (filters.nombre === "" || l.nombre === filters.nombre)
          )
          .map((l) => l.sectorNombre))],
        subSector: [...new Set(lotes
          .filter((l) =>
            (filters.sector === "" || l.sectorNombre === filters.sector) &&
            (filters.parte === "" || l.parteNombre === filters.parte) &&
            (filters.elemento === "" || l.elementoNombre === filters.elemento) &&
            (filters.nombre === "" || l.nombre === filters.nombre)
          )
          .map((l) => l.subSectorNombre))],
        parte: [...new Set(lotes
          .filter((l) =>
            (filters.sector === "" || l.sectorNombre === filters.sector) &&
            (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
            (filters.elemento === "" || l.elementoNombre === filters.elemento) &&
            (filters.nombre === "" || l.nombre === filters.nombre)
          )
          .map((l) => l.parteNombre))],
        elemento: [...new Set(lotes
          .filter((l) =>
            (filters.sector === "" || l.sectorNombre === filters.sector) &&
            (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
            (filters.parte === "" || l.parteNombre === filters.parte) &&
            (filters.nombre === "" || l.nombre === filters.nombre)
          )
          .map((l) => l.elementoNombre))],
        nombre: [...new Set(lotes
          .filter((l) =>
            (filters.sector === "" || l.sectorNombre === filters.sector) &&
            (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
            (filters.parte === "" || l.parteNombre === filters.parte) &&
            (filters.elemento === "" || l.elementoNombre === filters.elemento)
          )
          .map((l) => l.nombre))],
      });
    }
  }, [filters, lotes]);


  // Obtener la geolocalización al montar el componente
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

  // Cargar los lotes desde Firestore filtrados por el proyecto seleccionado
  const fetchLotes = async () => {
    try {

      if (!selectedProjectId) {
        console.error("No se encontró selectedProjectId");
        return;
      }

      // Referencia a la colección "lotes"
      const lotesCollection = collection(db, "lotes");

      // Aplicar filtro para que solo se obtengan los lotes del proyecto seleccionado
      const queryRef = query(lotesCollection, where("idProyecto", "==", selectedProjectId));

      // Obtener los documentos
      const lotesSnapshot = await getDocs(queryRef);

      // Formatear los datos
      const lotesData = lotesSnapshot.docs.map((doc) => ({
        loteId: doc.id, // Renombramos a loteId
        ...doc.data(),
      }));

      // Actualizar el estado con los lotes obtenidos
      setLotes(lotesData);
      console.log(`Número de documentos leídos: ${lotesSnapshot.size}`);

    } catch (error) {
      console.error("Error al cargar los lotes:", error);
    } finally {
      setLoading(false); // Marcar que la carga ha terminado
    }
  };

  // Llamar a fetchLotes cuando el componente se monta
  useEffect(() => {
    fetchLotes();
  }, []); // Ejecutar solo una vez al montar el componente


  useEffect(() => {
    if (modalSend) {
      const timer = setTimeout(() => {
        setModalSend(false);// Cierra el modal después de 3 segundos
      }, 2000); // 3000 ms = 3 segundos

      return () => clearTimeout(timer); // Limpia el temporizador si el componente se desmonta
    }
  }, [modalSend]);

  const fetchPpiDetails = async (ppiId) => {
    try {
      if (!ppiId) {
        console.error("No se encontró un ppiId válido.");
        return;
      }

      // Referencia directa al documento en Firestore
      const ppiDocRef = doc(db, "ppis", ppiId);
      const ppiDocSnap = await getDoc(ppiDocRef);

      if (ppiDocSnap.exists()) {
        const ppiData = ppiDocSnap.data();
        setPpiDetails(ppiData);
      } else {
        console.warn("No se encontró el PPI con el ID:", ppiId);
      }
    } catch (error) {
      console.error("Error al obtener el PPI:", error);
    }
  };



  const handleOpenModal = (lote) => {
    // Llamamos la función para obtener los detalles del PPI
    fetchPpiDetails(lote.ppiId);
    console.log(lote)
    setSelectedLote(lote);
    setIsModalOpen(true);

    const valueLote = lote.nombre;

    // Expresión regular para dividir por múltiples separadores: ",", "-", "|", "/"
    const separators = /[,|\-\/]+/;  // Cualquier combinación de ",", "-", "/" o "|"

    if (separators.test(valueLote)) {  // Si contiene alguno de estos separadores
      const optionsValueLote = valueLote.split(separators).map(option => option.trim());

      setLoteOptions(optionsValueLote);
    } else {
      setLoteOptions([valueLote]);  // Si no hay separadores, solo un valor
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalSend(false);
    setSelectedLote(null);
    setSelectedLoteOption("");

    // Reseteamos los checkboxes de actividades y subactividades
    setSelectedActivities({});
    setSelectedSubactivities({});
    setActivityObservations({});

    // Restablece el estado del formulario asegurando la estructura correcta
    setFormData({
      observaciones: "",
      observacionesActividad: "",
      observacionesLocalizacion: "",
      fechaHora: "",
      imagenes: [],
      mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "" }]
    });

    // 🔹 **Reset de actividades**
    setSelectedActivities({});
    setSelectedSubactivities({});
    setActivityObservations({});

    // Limpiar referencias de archivos
    fileInputsRefs.current.forEach((input) => {
      if (input) input.value = null;
    });
  };



  // Manejar los cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      // Manejo de campos dentro de objetos anidados
      if (name.startsWith("mediosDisponibles.")) {
        const field = name.split(".")[1];

        if (field === "numeroTrabajadores") {
          const numericValue = value.replace(/\D/g, "");
          return {
            ...prev,
            mediosDisponibles: {
              ...prev.mediosDisponibles,
              [field]: numericValue === "" ? "" : Number(numericValue),
            },
          };
        }

        return {
          ...prev,
          mediosDisponibles: {
            ...prev.mediosDisponibles,
            [field]: value,
          },
        };
      }







      // Manejo de otros campos normales
      return { ...prev, [name]: value };
    });
  };




  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const compressedFile = await compressImage(file);

        setFormData((prev) => {
          const updatedImages = [...prev.imagenes];
          updatedImages[index] = compressedFile; // Agrega la imagen seleccionada
          return { ...prev, imagenes: updatedImages };
        });
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
      }
    } else {
      // Elimina valores undefined explícitamente
      setFormData((prev) => {
        const updatedImages = [...prev.imagenes];
        updatedImages.splice(index, 1); // Remueve el índice si no hay archivo seleccionado
        return { ...prev, imagenes: updatedImages };
      });
    }
  };



  const uploadImageWithMetadata = async (file, index) => {
    if (!geolocalizacion) {
      throw new Error("Geolocalización no disponible.");
    }

    // Obtener el nombre del proyecto y del lote
    const loteNombre = selectedLote?.nombre || "SinNombreLote";

    // Formatear la fecha actual
    const fechaActual = new Date().toISOString().split("T")[0]; // Formato: YYYY-MM-DD

    // Crear un nombre descriptivo para el archivo
    const fileName = `${selectedProjectName}_${loteNombre}_${fechaActual}_${uniqueId}_${index}.jpg`
      .replace(/[/\\?%*:|"<>]/g, "");

    // Crear la referencia de almacenamiento
    const storagePath = `imagenes/${selectedProjectName}/${loteNombre}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    // Metadatos personalizados
    const metadata = {
      contentType: file.type,
      customMetadata: {
        latitude: geolocalizacion.lat.toString(),
        longitude: geolocalizacion.lng.toString(),
        proyecto: selectedProjectName,
        lote: loteNombre,
        fecha: fechaActual,
        observacion: observacionesImagenes[index] || ""
      },
    };

    // Subir la imagen con los metadatos
    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];

    // Validar fecha y hora
    if (!formData.fechaHora) {
      errors.push("⚠️ Debes seleccionar una fecha y hora.");
    }

    // Validar observaciones de actividad y localización
    if (!formData.observacionesActividad.trim()) {
      errors.push("⚠️ Debes llenar las observaciones de la actividad.");
    }
    if (!formData.observacionesLocalizacion.trim()) {
      errors.push("⚠️ Debes llenar las observaciones de la localización.");
    }

    // Validar que todas las actividades tengan "Aplica" o "No Aplica" seleccionadas
    const actividadesKeys = Object.keys(selectedActivities);

    if (actividadesKeys.length !== ppiDetails.actividades.length) {
      errors.push("⚠️ Debes evaluar todas las actividades (seleccionar 'Aplica' o 'No Aplica').");
    } else {
      actividadesKeys.forEach((index) => {
        const actividad = selectedActivities[index];

        if (!actividad.seleccionada && !actividad.noAplica) {
          errors.push(`⚠️ La actividad "${actividad.nombre}" no tiene selección (Aplica o No Aplica).`);
        }
      });
    }

    // Validar que al menos una observación esté presente
    const actividadesObservadas = Object.values(formData.observacionesActividades).every(
      (actividad) => actividad.trim() === ""
    );
    

    if (actividadesObservadas) {
      errors.push("⚠️ Debes ingresar al menos una observación en las actividades.");
    }



    // Si hay errores, mostrar en el modal
    if (errors.length > 0) {
      setErrorMessages(errors);
      setModalSend(true);
      return;
    }

    try {
      // Subir imágenes válidas y generar URLs
      const imageUrls = await Promise.all(
        formData.imagenes
          .filter((image) => image) // Filtra imágenes no válidas antes de mapear
          .map(async (image, index) => await uploadImageWithMetadata(image, index, observacionesImagenes[index] || ""))
      );

      // Formatear actividades con observaciones
      const actividadesConObservaciones = Object.keys(selectedActivities).map((index) => ({
        ...selectedActivities[index], // Copiamos los datos originales de la actividad
        observacion: activityObservations[index] || "", // Agregamos la observación si existe
      }));

      // Crear el registro sin imágenes undefined o null
      const registro = {
        ...selectedLote,
        ...formData,
        actividades: actividadesConObservaciones,
       
        imagenes: imageUrls,
        fechaHora: new Date(formData.fechaHora).toISOString(),
        actividad: selectedLote.nombre,
        resumenPuntosControl: {
          totalSi: stats.totalSi,
          totalActividades: stats.totalActividades,
          porcentajeApto: stats.porcentajeApto
        },
      };

      // Guardar en Firebase
      await addDoc(collection(db, "registrosParteDeObra"), registro);
      console.log("Registro guardado con éxito:", registro);

      // Restablece el estado del formulario asegurando la estructura correcta
      setFormData({
        observaciones: "",
        observacionesActividad: "",
        observacionesLocalizacion: "",
        fechaHora: "",
        imagenes: [],
        mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "" }]
      });

      // 🔹 **Reset de actividades**
      setSelectedActivities({});
      setSelectedSubactivities({});
      setActivityObservations({});



      // Limpiar referencias de archivos
      fileInputsRefs.current.forEach((input) => {
        if (input) input.value = null;
      });

      setIsModalOpen(false);
      setModalSend(true);
      setMessageModalSend("Registro enviado");
      setErrorMessages([]); // Limpiar errores si el envío fue exitoso

    } catch (error) {
      console.error("Error al guardar el registro:", error);
      setErrorMessages(["❌ Error al guardar. Revisa los datos antes de enviar."]);
      setModalSend(true);
    }
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-300 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-semibold text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }


  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3, // Tamaño máximo de la imagen en MB
      maxWidthOrHeight: 1024, // Máximo tamaño en píxeles
      useWebWorker: true, // Usa un worker para optimizar el rendimiento
    };

    try {
      console.log("Compresión de imagen iniciada:", file);
      const compressedFile = await imageCompression(file, options);
      console.log("Imagen comprimida:", compressedFile);
      return compressedFile;
    } catch (error) {
      console.error("Error al comprimir la imagen:", error);
      return file; // Si hay error, sube la imagen original
    }
  };




  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Filtrar los lotes según los filtros aplicados
  const filteredLotes = lotes.filter(
    (l) =>
      (filters.sector === "" || l.sectorNombre === filters.sector) &&
      (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
      (filters.parte === "" || l.parteNombre === filters.parte) &&
      (filters.elemento === "" || l.elementoNombre === filters.elemento) &&
      (filters.nombre === "" || l.nombre === filters.nombre)
  );

  const handleGoBack = () => {
    navigate('/'); // Navega hacia atrás en el historial
  };

  const labelMapping = {
    sector: "Grupo activos",
    subSector: "Activo",
    parte: "Inventario vial",
    elemento: "Componente",
    nombre: "Área inspección",
  };


  // Filtrar valores del lote


  const handleSubactivityChange = (actividadIndex, subIndex) => {
    setSelectedActivities((prev) => {
      const newSelected = { ...prev };

      if (!newSelected[actividadIndex]) return prev;

      newSelected[actividadIndex].subactividades[subIndex].seleccionada =
        !newSelected[actividadIndex].subactividades[subIndex].seleccionada;

      const allChecked = newSelected[actividadIndex].subactividades.every((sub) => sub.seleccionada);
      newSelected[actividadIndex].seleccionada = allChecked;

      if (newSelected[actividadIndex].subactividades.some((sub) => sub.seleccionada)) {
        newSelected[actividadIndex].noAplica = false;
      }

      return newSelected;
    });
  };






  const handleActivityChange = (actividadIndex, actividadNombre, subactividades, value) => {
    setSelectedActivities((prev) => {
      const newSelected = { ...prev };

      // Si no existe la actividad en el estado, la creamos
      if (!newSelected[actividadIndex]) {
        newSelected[actividadIndex] = {
          nombre: actividadNombre,
          seleccionada: value === "si",
          noAplica: false,
          subactividades: subactividades.map((sub) => ({
            nombre: sub.nombre,
            seleccionada: value === "si",
          })),
        };
      } else {
        // Actualizar la selección dependiendo de si es "Cumple" o "No Cumple"
        newSelected[actividadIndex].seleccionada = value === "si";

        // Actualizar las subactividades con la misma selección
        newSelected[actividadIndex].subactividades = newSelected[actividadIndex].subactividades.map((sub) => ({
          ...sub,
          seleccionada: value === "si",
        }));

        // Si se selecciona "Cumple" o "No Cumple", desactivar "No Aplica"
        newSelected[actividadIndex].noAplica = false;
      }

      return newSelected;
    });
  };












  // Enviar formulario


  const handleNoAplicaChange = (actividadIndex) => {
    setSelectedActivities((prev) => {
      const newSelected = { ...prev };

      // Si la actividad aún no está en el estado, la creamos con `noAplica: true`
      if (!newSelected[actividadIndex]) {
        newSelected[actividadIndex] = {
          seleccionada: false,
          noAplica: true,
          subactividades: [],
        };
      } else {
        // Alternamos el estado de "No Aplica"
        newSelected[actividadIndex].noAplica = !newSelected[actividadIndex].noAplica;

        // Si se activa "No Aplica", desmarcamos la actividad, subactividades y borramos observaciones
        if (newSelected[actividadIndex].noAplica) {
          newSelected[actividadIndex].seleccionada = false;
          newSelected[actividadIndex].subactividades = newSelected[actividadIndex].subactividades.map((sub) => ({
            ...sub,
            seleccionada: false,
          }));
          setActivityObservations((prev) => ({
            ...prev,
            [actividadIndex]: "", // Borra la observación de la actividad
          }));
        }
      }

      return newSelected;
    });
  };




  const getBackgroundColor = () => {
    if (stats.porcentajeApto === 100) return "bg-green-200 text-gray-500";
    if (stats.porcentajeApto >= 50) return "bg-amber-200 text-gray-500";
    return "bg-red-200 text-gray-500";
  };


  const handleActivityObservationChange = (actividad, value) => {
    setFormData((prev) => ({
      ...prev,
      observacionesActividades: {
        ...prev.observacionesActividades,
        [actividad]: value, // Accede directamente a la actividad usando su nombre
      }
    }));
  };

  // Función para alternar la visibilidad de las observaciones
  const toggleActivityVisibility = () => {
    setActivityVisibility((prev) => !prev);
  };

  return (
    <div className="container mx-auto xl:px-14 py-2 text-gray-500 mb-10 min-h-screen">
      <div className="flex md:flex-row flex-col gap-2 items-center justify-between px-5 py-3 text-md">
        {/* Navegación */}
        <div className="flex gap-2 items-center">
          {/* Elementos visibles solo en pantallas medianas (md) en adelante */}
          <GoHomeFill className="hidden md:block" style={{ width: 15, height: 15, fill: "#d97706" }} />
          <Link to="#" className="hidden md:block font-medium text-gray-600">
            Home
          </Link>
          <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />
          <h1 className="hidden md:block font-medium">Ver registros</h1>
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


      <div className="pt-6 pb-8 px-4">
        <div className="grid grid-cols-1 gap-4 text-xs items-end">
          {/* Solo mostrar el filtro de "nombre" (Actividades de mantenimiento) */}
          <div>
            <label className="block font-medium text-gray-700 capitalize">
              {labelMapping["nombre"] || "Áreas"}
            </label>
            <select
              name="nombre"
              value={filters["nombre"]}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Todos</option>
              {uniqueValues["nombre"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>




      <div className="px-4">
        {/* Contenedor general con scroll horizontal para pantallas grandes */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="border-gray-200 bg-sky-600 text-white">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold w-3/4">
                  Actividades mantenimiento, conservación, rehabilitación
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold w-1/4">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...filteredLotes]
                .sort((a, b) => a.sectorNombre.localeCompare(b.sectorNombre)) // Ordena por sectorNombre
                .map((lote) => (
                  <tr
                    key={lote.loteId}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 text-sm w-3/4">
                      <div>
                        <span className="font-medium text-gray-800">{lote.nombre}</span>
                      </div>
                      {lote.ppiNombre && (
                        <div>
                          <span className="text-green-600">PPI: {lote.ppiNombre}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm w-1/4">
                      <button
                        onClick={() => handleOpenModal(lote)}
                        className="px-4 py-2 bg-gray-500 text-white font-medium rounded-md shadow-sm hover:bg-sky-700 transition duration-150 flex gap-2 items-center"
                      >
                        <IoMdAddCircle /> Nuevo Registro
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

        </div>

        {/* Vista para dispositivos móviles: cards */}
        <div className="block lg:hidden">
          {filteredLotes
            .map((lote) => (
              <div
                key={lote.loteId}
                className="bg-gray-100 shadow rounded-lg p-4 mb-4 border border-gray-200"
              >
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Sector:</span> {lote.elementoNombre}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Actividad:</span> {lote.nombre}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">PPI:</span>{" "}
                  <span className="text-green-600">{lote.ppiNombre}</span>
                </p>
                <button
                  onClick={() => handleOpenModal(lote)}
                  className="mt-4 w-full px-4 py-2 bg-gray-500 text-white font-medium rounded-md shadow-sm hover:bg-sky-700 transition duration-150 flex gap-2 justify-center items-center"
                >
                  <IoMdAddCircle /> Nuevo Registro
                </button>
              </div>
            ))}
        </div>
      </div>



      {/* Modal para el formulario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] relative overflow-y-auto">
            {/* Botón de cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-800 transition"
              aria-label="Cerrar"
            >
              <IoClose />
            </button>

            {/* Título del modal */}
            <h2 className="text-lg font-semibold text-start flex gap-2 items-center">
              <BsClipboardData className="text-2xl" />
              Registro de actividades
            </h2>
            <p className="text-md ps-8">Formulario seguridad y salud.</p>

            <div className="w-full border-b-2 mt-2 mb-6"></div>

            <div>

              <div>
                <p className="font-semibold bg-gray-300 rounded-t-lg px-4 py-2">
                  Actividad seleccionada
                </p>
                {selectedLote && (
                  <p className="bg-gray-200 p-2 rounded-b-lg px-4 py-2 font-medium">{selectedLote.nombre}</p>
                )}
              </div>


              <div>
                {/* Observaciones de Actividad */}
                <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">1. Trabajos inspeccionados</h3>
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium px-4">¿Qué actividades se inspeccionan?</label>

                  <button
                    onClick={toggleActivityVisibility}
                    className="px-4 py-2 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition"
                  >
                    {activityVisibility ? "Ocultar actividades" : "Agregar actividades"}
                  </button>
                </div>
              </div>
              {/* Observaciones de Actividades */}
              <div className="mt-4">
                {/* Botón para mostrar u ocultar las observaciones */}


                {/* Sección de observaciones de actividades */}
                <div className={`${activityVisibility ? "" : "hidden"} mt-4`}>
                  {Object.keys(formData.observacionesActividades).map((key, index) => (
                    <div key={index}>
                      
                      <VoiceRecorderInput
                        maxLength={100}
                        name={`observacionesActividad-${key}`}
                        value={formData.observacionesActividades[key]}
                        onChange={(name, value) => handleActivityObservationChange(key, value)}
                        placeholder={`Actividad ${index + 1}`} // Usa la clave como parte del placeholder
                      
                      />
                    </div>
                  ))}
                </div>

              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium px-4">
                  ¿Dónde se ubica?
                </label>
                <VoiceRecorderInput
                  maxLength={100}
                  name="observacionesLocalizacion"
                  value={formData.observacionesLocalizacion}
                  onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}  // Actualizamos el estado de formData
                  placeholder="Escribe tus observaciones aquí..."
                />
              </div>
            </div>

            {/* Medios disponibles, empresa y trabajadores */}

            <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">
              2. Medios disponibles en obra: Empresas, trabajadores y maquinaria.
            </h3>

            {formData.mediosDisponibles.map((empresa, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="Nombre empresa"
                  value={empresa.nombreEmpresa}
                  onChange={(e) => handleMediosChange(index, "nombreEmpresa", e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />

                <input
                  type="text"
                  placeholder="Nº Trabajadores"
                  value={empresa.numeroTrabajadores}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(e) => handleMediosChange(index, "numeroTrabajadores", e.target.value.replace(/\D/g, ""))}
                  className="block w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmpresa(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg shadow-sm hover:bg-red-600"
                  >
                    <FaDeleteLeft />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddEmpresa}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-sm hover:bg-gray-500"
            >
              + Agregar Empresa
            </button>




            {/* Fecha y Hora */}
            <div>
              <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                Fecha y Hora
              </label>
              <input
                required
                type="datetime-local"
                name="fechaHora"
                value={formData.fechaHora}
                onChange={handleInputChange}
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>


            {/* Observaciones en materia seguridad y salud */}
            <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">3. Observaciones en materia de seguridad y salud</h3>

            <div>
              <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                Observaciones generales
              </label>
              <VoiceRecorderInput
                maxLength={300}
                name="observaciones"
                value={formData.observaciones}
                onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}  // Actualizamos el estado de formData
                placeholder="Escribe tus observaciones aquí..."
              />
            </div>

            <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">4. Previsión de actividades de próximo inicio. Medias preventivas y pasos.</h3>
            {/* Previsión de Actividades de Próximo Inicio */}
            <div className="mt-6">
              <label className="block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                Previsión de Actividades de Próximo Inicio
              </label>

              {/* Actividades de Próximo Inicio */}
              <div className="">
                <label className="mt-2 block px-4 py-2 rounded-md text-sm font-medium">
                  Actividades de Próximo Inicio
                </label>
                <VoiceRecorderInput
                  maxLength={200}
                  name="actividadesProximoInicio"
                  value={formData.actividadesProximoInicio || ""}
                  onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}  // Actualizamos el estado de formData
                  placeholder="Escribe tus observaciones aquí..."
                />
              </div>

              {/* Medidas Preventivas a Implantar */}
              <div>
                <label className="block px-4 py-2 rounded-md text-sm font-medium">
                  Medidas Preventivas a Implantar en Obra
                </label>
                <VoiceRecorderInput
                  maxLength={200}
                  name="medidasPreventivas"
                  value={formData.medidasPreventivas || ""}
                  onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}  // Actualizamos el estado de formData
                  placeholder="Escribe tus observaciones aquí..."
                />
              </div>
            </div>

            <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">5. Detalles de la inspección</h3>

            {ppiDetails && (
              <div>


                {/* Contenedor con scroll vertical */}
                <div className="mt-4 ps-4">
                  {ppiDetails.actividades.map((actividad, actividadIndex) => {
                    // Filtramos las subactividades que tienen nombre válido
                    const subactividadesValidas = Array.isArray(actividad.subactividades)
                      ? actividad.subactividades.filter((sub) => sub.nombre.trim() !== "")
                      : [];

                    return (
                      <div key={actividadIndex} className="mb-4 border-b pb-3">
                        {/* Checkbox y título de la actividad */}
                        <div className="">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <p className="font-semibold text-sky-700">{actividad.numero}-</p>
                              <p className="font-semibold text-sky-700">{actividad.actividad}</p>
                            </div>


                            {/* Estado de la actividad (Cumple, No cumple, No aplica) */}
                            <div className="flex gap-3 text-xs text-gray-700 font-medium">

                              {/* ✅ Checkbox para marcar Sí (Cumple) */}
                              <label className={`flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer
    ${selectedActivities[actividadIndex]?.noAplica ? "text-gray-400 bg-gray-100 border-gray-300 cursor-not-allowed" :
                                  selectedActivities[actividadIndex]?.seleccionada === true ? "text-gray-800 font-bold bg-gray-300 border-gray-500" : "text-gray-500 border-gray-300"}`}
                              >
                                <input
                                  maxLength={300}
                                  type="radio"
                                  name={`actividad-${actividadIndex}`}
                                  value="si"
                                  checked={selectedActivities[actividadIndex]?.seleccionada === true}
                                  onChange={() => handleActivityChange(actividadIndex, actividad.actividad, subactividadesValidas, "si")}
                                  disabled={selectedActivities[actividadIndex]?.noAplica}
                                  className="hidden"
                                />
                                ✅ Aplica
                              </label>



                              {/* ⚪ Checkbox "No Aplica" */}
                              <label className={`flex items-center gap-1 px-3 py-1 border rounded-md cursor-pointer
    ${selectedActivities[actividadIndex]?.noAplica ? "text-gray-800 font-bold bg-gray-200 border-gray-500" : "text-gray-500 border-gray-300"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedActivities[actividadIndex]?.noAplica || false}
                                  onChange={() => handleNoAplicaChange(actividadIndex)}
                                  className="hidden"
                                />
                                ⚪ No Aplica
                              </label>

                            </div>


                          </div>






                        </div>

                        {/* Mostrar subactividades solo si existen y tienen nombre válido */}
                        {subactividadesValidas.length > 0 &&
                          subactividadesValidas.map((sub, subIndex) => (
                            <div key={subIndex} className="ml-4 flex items-center gap-2 text-xs border-l-4 border-gray-500 pl-2 mt-2">
                              <input
                                type="checkbox"
                                checked={selectedActivities[actividadIndex]?.subactividades[subIndex]?.seleccionada || false}
                                onChange={() => handleSubactivityChange(actividadIndex, subIndex)}
                                disabled={selectedActivities[actividadIndex]?.noAplica}
                                className="form-checkbox h-3 w-3 text-sky-600"
                              />
                              <div>
                                <p className="text-gray-700 font-medium">{sub.numero} - {sub.nombre}</p>
                                <p className="text-gray-600 italic text-xs">Tipo: {sub.tipo_inspeccion}</p>
                              </div>
                            </div>
                          ))}

                        {/* Observaciones de la actividad */}


                        {/* Observaciones de la actividad */}
                        <VoiceRecorderInput
                          name={`observacionesActividad-${actividadIndex}`}
                          value={activityObservations[actividadIndex] || ""} // Valor del estado
                          onChange={(name, value) => handleObservationChange(actividadIndex, value)} // Llama al mismo manejador
                          placeholder="Escribe observaciones aquí..."
                          maxLength={200}
                          disabled={selectedActivities[actividadIndex]?.noAplica} // Deshabilitar cuando sea "No Aplica"
                          className={selectedActivities[actividadIndex]?.noAplica ? "bg-gray-200 cursor-not-allowed" : ""} // Estilo cuando es "No Aplica"
                        />


                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Estadísticas de apto debajo de los checkboxes */}
            <div className={` font-medium py-2 px-4 rounded-lg flex gap-5 justify-between ${getBackgroundColor()}`}>
              <span>Resumen total</span><p>{stats.totalSi} puntos de {stats.totalActividades}  ({stats.porcentajeApto}%)</p>
            </div>




            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">



              <div className="mt-6">
                <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">6. Reportaje fotográfico de la visita.</h3>
                {/* Imágenes */}
                <div className="mb-4 ps-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Registro fotográfico
                    <p className="text-amber-600 text-xs">* Mínimo 1 imagen</p>
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          capture="camera"
                          ref={(el) => (fileInputsRefs.current[index] = el)}
                          onChange={(e) => handleFileChange(e, index)}
                          className="hidden" // Oculta el input original
                          id={`file-upload-${index}`}
                        />
                        <label
                          htmlFor={`file-upload-${index}`}
                          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-center bg-indigo-100 text-indigo-600 font-semibold cursor-pointer hover:bg-indigo-200"
                        >
                          Seleccionar archivo
                        </label>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                          {fileInputsRefs.current[index]?.files[0]?.name || "Ningún archivo seleccionado"}
                        </p>

                        {/* 🔹 Campo para observaciones */}
                        <textarea
                          placeholder="Observaciones de la imagen..."
                          value={observacionesImagenes[index] || ""}
                          onChange={(e) => setObservacionesImagenes((prev) => ({
                            ...prev,
                            [index]: e.target.value
                          }))}
                          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"
                        ></textarea>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Registro Documental de Empresas */}
                {/* <div className="mb-4">
                  <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    Registro Documental de Empresas, Trabajadores y Maquinaria.
                  </label>
                  <textarea
                    maxLength={300}
                    name="registroEmpresas"
                    value={formData.registroEmpresas || ""}
                    onChange={handleInputChange}
                    placeholder="Escribe observaciones..."
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"
                  ></textarea>
                </div> */}

                {/* Control de Accesos a la Obra */}
                {/* <div className="mb-4">
                  <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    Control de Accesos a la Obra
                  </label>
                  <textarea
                    maxLength={300}
                    name="controlAccesos"
                    value={formData.controlAccesos || ""}
                    onChange={handleInputChange}
                    placeholder="Escribe observaciones..."
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"
                  ></textarea>
                </div> */}

                {/* Control de la Subcontratación */}
                {/* Opciones Sí / No para Control de la Subcontratación */}
                {/* <div className="mt-2">
                  <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    Control de Accesos a la Obra
                  </label>

                  <div className="flex gap-4 ps-4 mt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="controlSubcontratacion.seleccionada"
                        value="si"
                        checked={formData.controlSubcontratacion.seleccionada === "si"}
                        onChange={handleInputChange}
                        className="form-radio text-sky-600"
                      />
                      Dar de alta
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="controlSubcontratacion.seleccionada"
                        value="no"
                        checked={formData.controlSubcontratacion.seleccionada === "no"}
                        onChange={handleInputChange}
                        className="form-radio text-sky-600"
                      />
                      No dar de alta
                    </label>
                  </div>
                </div> */}

                {/* Input para ingresar el nombre de la empresa (Solo si selecciona "Sí") */}
                {/* {formData.controlSubcontratacion.seleccionada === "si" && (
                  <div className="mt-2">
                    <input
                      maxLength={300}
                      type="text"
                      name="controlSubcontratacion.nombreEmpresaSubcontrata"
                      value={formData.controlSubcontratacion.nombreEmpresaSubcontrata || ""}
                      onChange={handleInputChange}
                      placeholder="Nombre de la empresa"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                )} */}

                {/* Observaciones de la Subcontratación */}
                {/* <textarea
                  maxLength={300}
                  name="controlSubcontratacion.controlSubcontratacion"
                  value={formData.controlSubcontratacion.controlSubcontratacion || ""}
                  onChange={handleInputChange}
                  placeholder="Escribe observaciones..."
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"
                /> */}



                {/* Siniestralidad y planificación de actuaciones de emergencia */}
                {/* <div>
                  <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    Siniestralidad y planificación de actuaciones de emergencia
                  </label>

                
                  <div className="flex items-center gap-4 mt-2">
                    <label className="ml-4 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="controlSiniestraidad.seleccionado"
                        value="true"
                        checked={formData.controlSiniestraidad.seleccionado === true}
                        onChange={handleInputChange}
                        className="form-radio text-sky-600"
                      />
                      Sí
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="radio"
                        name="controlSiniestraidad.seleccionado"
                        value="false"
                        checked={formData.controlSiniestraidad.seleccionado === false}
                        onChange={handleInputChange}
                        className="form-radio text-sky-600"
                      />
                      No
                    </label>
                  </div>


                  Observaciones de siniestralidad
                  <textarea
                    maxLength={300}
                    name="controlSiniestraidad.observacionesSiniestralidad"
                    value={formData.controlSiniestraidad.observacionesSiniestralidad}
                    onChange={handleInputChange}
                    placeholder="Escribe observaciones..."
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 resize-none"
                  ></textarea>
                </div> */}



              </div>



              {/* Resultado */}

              {/* <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2">7. Resultado de la inspección.</h3>
              <div className="relative">
                <select
                  name="apto"
                  value={formData.apto || ""}
                  onChange={handleInputChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 bg-white appearance-none"
                >
                  <option value="" disabled>Selecciona una opción</option>
                  <option value="apto">✅ Apto</option>
                  <option value="no_apto">❌ No Apto</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <FaCheck className={`text-green-600 ${formData.apto === "apto" ? "block" : "hidden"}`} />
                  <MdOutlineError className={`text-red-600 ${formData.apto === "no_apto" ? "block" : "hidden"}`} />
                </div>
              </div> */}



              <div className="w-full p-2 border-b-4"></div>
              {/* Botones */}
              <div className="flex justify-between items-center gap-4 mt-12">
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-amber-600 text-white font-semibold rounded-lg shadow-md hover:bg-amber-700 transition mt-4"
                  onClick={handleSubmit}
                >
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/3 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition mt-4"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl relative flex flex-col justify-center items-center gap-4 w-80">

            {/* ❌ Botón de cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-800 transition"
              aria-label="Cerrar"
            >
              <IoClose />
            </button>

            {/* ✅ Ícono dinámico según el mensaje */}
            {messageModalSend === 'Registro enviado' ? (
              <FaCheck className="text-teal-500 text-4xl" />
            ) : (
              <MdOutlineError className="text-red-500 text-4xl" />
            )}

            {/* 📌 Mensaje dinámico */}
            <p className="text-lg font-medium text-gray-700">{messageModalSend}</p>
          </div>
        </div>
      )}


      {modalSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50">
          <div className={`bg-white p-8 rounded-2xl shadow-xl relative flex flex-col justify-center items-center gap-4 w-96 
      ${errorMessages.length > 0 ? 'border-red-500' : 'border-teal-500'}`}>

            {/* ❌ Botón de cerrar */}
            <button
              onClick={() => setModalSend(false)}
              className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-800 transition"
              aria-label="Cerrar"
            >
              <IoClose />
            </button>

            {/* 🚨 Modal de Error */}
            {errorMessages.length > 0 ? (
              <>
                <MdOutlineError className="text-red-500 text-4xl" />
                <p className="text-lg font-medium text-red-600">Error en el formulario</p>
                <ul className="text-sm text-gray-600 list-disc px-6 space-y-1">
                  {errorMessages.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </>
            ) : (
              /* ✅ Modal de Éxito */
              <>
                <FaCheck className="text-teal-500 text-4xl" />
                <p className="text-lg font-medium text-gray-700">{messageModalSend}</p>
              </>
            )}
          </div>
        </div>
      )}


    </div>
  );
};

export default ParteObra;
