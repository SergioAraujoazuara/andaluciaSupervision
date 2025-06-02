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

/**
 * ParteObra Component
 *
 * This component is a comprehensive inspection form used to register construction site activities.
 * It supports two types of reports: "visita" (site visit) and "acta" (meeting minutes).
 *
 * Features:
 * - Filters and selects inspection tasks ("lotes") associated with a selected project.
 * - Dynamically loads PPI (Inspection Point Plan) details and displays associated activities and subactivities.
 * - Allows recording general observations, safety issues, available resources (companies, workers, equipment), and inspection images with GPS metadata.
 * - Provides voice-to-text support via the VoiceRecorderInput component for easier input of observations.
 * - Validates required fields and ensures all activities are assessed.
 * - Compresses and uploads images with location metadata to Firebase Storage.
 * - Stores the complete record in Firestore under either `registrosParteDeObra` or `registrosActasDeReunion`, depending on the report type.
 * - Displays modals for success or validation errors with helpful feedback.
 *
 * Dependencies:
 * - Firebase Firestore & Storage
 * - React Router
 * - Tailwind CSS for styling
 * - UUID for unique file naming
 * - VoiceRecorderInput for dictation-based input
 *
 * This form is optimized for both desktop and mobile views and aims to streamline and validate daily site inspection reporting.
 * 
 * Main Functions:
 * ---------------
 * - `fetchLotes`: Loads construction work units (lotes) from Firestore associated with the selected project.
 * - `fetchPpiDetails`: Retrieves the PPI (Inspection Point Plan) data for a selected work unit.
 * - `handleOpenModal`: Opens the form modal and loads the selected work unit and its PPI.
 * - `handleCloseModal`: Resets all form data and closes the modal.
 * - `handleInputChange`: Updates form values based on user input.
 * - `handleFileChange`: Compresses and prepares an image file for upload.
 * - `uploadImageWithMetadata`: Uploads an image to Firebase Storage with geolocation and observation metadata.
 * - `handleSubmit`: Validates the form and submits the final record to Firestore.
 * - `compressImage`: Compresses images to reduce file size before uploading.
 * - `handleActivityChange`: Marks an activity as applicable and sets the selected state for its subactivities.
 * - `handleSubactivityChange`: Toggles the selected state of a subactivity.
 * - `handleNoAplicaChange`: Marks an activity as "not applicable" and resets its state.
 * - `handleFilterChange`: Updates filter values for selecting specific work units.
 * - `getBackgroundColor`: Returns a color class based on the percentage of compliant activities.
 * - `handleAddEmpresa`, `handleRemoveEmpresa`, `handleMediosChange`: Manage available resources (companies, workers, machinery) in the form.
 */


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
    mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "", maquinaria: "" }],
    previsionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
  });
  const [activityVisibility, setActivityVisibility] = useState(true);
  const [visibleActivities, setVisibleActivities] = useState(1);
  const [visiblePrevisiones, setVisiblePrevisiones] = useState(1);

  // Nuevos estados para el manejo de imágenes
  const [imageUploadStatus, setImageUploadStatus] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  const handleShowMoreActivities = () => {
    setVisibleActivities(prev => prev + 1);
  };

  const handleShowMorePrevisiones = () => {
    setVisiblePrevisiones(prev => prev + 1);
  };
  const handlePrevisionChange = (actividad, value) => {
    setFormData((prev) => ({
      ...prev,
      previsionesActividades: {
        ...prev.previsionesActividades,
        [actividad]: value,
      }
    }));
  };


  const fileInputsRefs = useRef([]);
  const [geolocalizacion, setGeolocalizacion] = useState(null);

  const [loteOptions, setLoteOptions] = useState([]);
  const [selectedLoteOption, setSelectedLoteOption] = useState("");


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

  
  const [modalSend, setModalSend] = useState(false)
  const [messageModalSend, setMessageModalSend] = useState('')
  const [ppiDetails, setPpiDetails] = useState(null); 
  const [selectedSubactivities, setSelectedSubactivities] = useState({});
  const [stats, setStats] = useState({ totalSi: 0, totalNo: 0, totalActividades: 0, porcentajeApto: 0 });
  const [activityObservations, setActivityObservations] = useState({});
  const [errorMessages, setErrorMessages] = useState([]);
  const [observacionesImagenes, setObservacionesImagenes] = useState({});
  const [firma, setFirma] = useState(null); 
  const [formType, setFormType] = useState('visita'); 
  const [selectedActivities, setSelectedActivities] = useState({});

  const handleVisitaClick = () => {
    setFormType('visita');
    localStorage.setItem('formType', formType)
  };

  const handleActaReunionClick = () => {
    setFormType('acta');
    localStorage.setItem('formType', formType)
  };



  const handleObservationChange = (actividadIndex, value) => {
    setActivityObservations((prev) => ({
      ...prev,
      [actividadIndex]: value, 
    }));
  };


  const handleAddEmpresa = () => {
    setFormData((prev) => ({
      ...prev,
      mediosDisponibles: [...prev.mediosDisponibles, { nombreEmpresa: "", numeroTrabajadores: "", maquinaria: "" }]
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






  useEffect(() => {
    if (ppiDetails && ppiDetails.actividades) {
      const totalActividadesInicial = ppiDetails.actividades.length;
      const totalActividades = totalActividadesInicial - Object.values(selectedActivities).filter(act => act.noAplica).length;
      const totalSi = Object.values(selectedActivities).filter(act => act.seleccionada === true).length;
      const totalNo = Object.values(selectedActivities).filter(act => act.seleccionada === false).length;
      const porcentajeApto = totalActividades > 0 ? Math.round((totalSi / totalActividades) * 100) : 0;

      setStats({ totalSi, totalNo, totalActividades, porcentajeApto, totalActividadesInicial });
    }
  }, [selectedActivities, ppiDetails]);



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
     

    } catch (error) {
      console.error("Error al cargar los lotes:", error);
    } finally {
      setLoading(false); // Marcar que la carga ha terminado
    }
  };


  useEffect(() => {
    fetchLotes();
  }, []); 


  useEffect(() => {
    if (modalSend) {
      const timer = setTimeout(() => {
        setModalSend(false);
      }, 2000); 

      return () => clearTimeout(timer);
    }
  }, [modalSend]);

  const fetchPpiDetails = async (ppiId) => {
    try {
      if (!ppiId) {
        console.error("No se encontró un ppiId válido.");
        return;
      }

    
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

  // Función para inicializar el estado del formulario a valores por defecto
  const initializeFormState = () => {
    setFormData({
      observaciones: "",
      observacionesActividad: "",
      observacionesLocalizacion: "",
      fechaHora: "",
      imagenes: [],
      mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "", maquinaria: "" }],
      observacionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
      previsionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
    });
    setVisiblePrevisiones(1);
    setVisibleActivities(1);
    setSelectedActivities({});
    setSelectedSubactivities({});
    setActivityObservations({});
    setImageUploadStatus({});
    setImagePreviews({});
    setImageErrors({});
    fileInputsRefs.current.forEach((input) => {
      if (input) input.value = null;
    });
    setErrorMessages([]); // Limpiar mensajes de error
    setMessageModalSend(''); // Limpiar mensaje del modal de envío
  };

  const handleOpenModal = (lote) => {
    fetchPpiDetails(lote.ppiId);
    setSelectedLote(lote);

    // Intentar cargar borrador desde LocalStorage
    const savedDraft = localStorage.getItem(`parteObraDraft_${lote.loteId}`);

    if (savedDraft) {
      // Si hay un borrador, preguntar al usuario
      const loadDraft = window.confirm("Se encontró un borrador guardado para este lote. ¿Deseas cargarlo?");

      if (loadDraft) {
        try {
          const draftState = JSON.parse(savedDraft);
          // Cargar los estados desde el borrador
          setFormData(draftState.formData);
          setSelectedActivities(draftState.selectedActivities);
          setSelectedSubactivities(draftState.selectedSubactivities);
          setActivityObservations(draftState.activityObservations);
          setObservacionesImagenes(draftState.observacionesImagenes);
          setVisibleActivities(draftState.visibleActivities);
          setVisiblePrevisiones(draftState.visiblePrevisiones);

          // Cargar estados relacionados con imágenes si existen en el borrador
          if (draftState.imagePreviews) {
            setImagePreviews(draftState.imagePreviews);
          }
          if (draftState.imageUploadStatus) {
            setImageUploadStatus(draftState.imageUploadStatus);
          }
          if (draftState.imageErrors) {
            setImageErrors(draftState.imageErrors);
          }

          // No cargamos fileInputsRefs ni formData.imagenes (objetos File)
          // ya que dependen de la sesión actual y los archivos cargados.

        } catch (error) {
          console.error("Error al cargar borrador desde LocalStorage:", error);
          alert("Error al cargar borrador. Se iniciará un formulario nuevo.");
          initializeFormState(); // Inicializar si falla la carga
        }
      } else {
        // Si el usuario no quiere cargar, inicializar formulario
        initializeFormState();
      }
    } else {
      // Si no hay borrador, inicializar formulario
      initializeFormState();
    }

    setIsModalOpen(true);

    const valueLote = lote.nombre;
    const separators = /[,|\-\/]+/;

    if (separators.test(valueLote)) {  
      const optionsValueLote = valueLote.split(separators).map(option => option.trim());

      setLoteOptions(optionsValueLote);
    } else {
      setLoteOptions([valueLote]); 
    }
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalSend(false);
    setSelectedLote(null);
    setSelectedLoteOption("");
    initializeFormState(); // Usar la nueva función para resetear estados
  };


  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    
    if (file) {
      try {
        // Actualizar estado de carga
        setImageUploadStatus(prev => ({
          ...prev,
          [index]: { status: 'compressing', progress: 0 }
        }));
        
        // Crear preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => ({
            ...prev,
            [index]: reader.result
          }));
        };
        reader.readAsDataURL(file);

        // Comprimir imagen
        const compressedFile = await compressImage(file);
        
        // Actualizar estado de compresión completada
        setImageUploadStatus(prev => ({
          ...prev,
          [index]: { status: 'compressed', progress: 100 }
        }));

        // Actualizar formData
        setFormData((prev) => {
          const updatedImages = [...prev.imagenes];
          updatedImages[index] = compressedFile;
          return { ...prev, imagenes: updatedImages };
        });

        // Limpiar error si existía
        setImageErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[index];
          return newErrors;
        });

      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        setImageErrors(prev => ({
          ...prev,
          [index]: "Error al procesar la imagen. Intente nuevamente."
        }));
        setImageUploadStatus(prev => ({
          ...prev,
          [index]: { status: 'error', progress: 0 }
        }));
      }
    } else {
      // Limpiar estados si se elimina la imagen
      setImageUploadStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[index];
        return newStatus;
      });
      setImagePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[index];
        return newPreviews;
      });
      setImageErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
      
      setFormData((prev) => {
        const updatedImages = [...prev.imagenes];
        updatedImages.splice(index, 1);
        return { ...prev, imagenes: updatedImages };
      });
    }
  };



  const uploadImageWithMetadata = async (file, index) => {
    if (!geolocalizacion) {
      throw new Error("Geolocalización no disponible.");
    }

    const loteNombre = selectedLote?.nombre || "SinNombreLote";

    const fechaActual = new Date().toISOString().split("T")[0];

    const fileName = `${selectedProjectName}_${loteNombre}_${fechaActual}_${uniqueId}_${index}.jpg`
      .replace(/[/\\?%*:|"<>]/g, "");

    const storagePath = `imagenes/${selectedProjectName}/${loteNombre}/${fileName}`;
    const storageRef = ref(storage, storagePath);

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

    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    let errors = [];

    if (!formData.fechaHora) {
      errors.push("⚠️ Debes seleccionar una fecha y hora.");
    }

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

    const actividadesObservadas = formType === 'visita' && Object.values(formData.observacionesActividades).every(
      (actividad) => actividad.trim() === ""
    );

    if (actividadesObservadas) {
      errors.push("⚠️ Debes ingresar al menos una observación en las actividades.");
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setModalSend(true);
      return;
    }

    try {
      const imageUrls = await Promise.all(
        formData.imagenes
          .filter((image) => image) 
          .map(async (image, index) => await uploadImageWithMetadata(image, index, observacionesImagenes[index] || ""))
      );

  
      const actividadesConObservaciones = Object.keys(selectedActivities).map((index) => ({
        ...selectedActivities[index], 
        observacion: activityObservations[index] || "", 
      }));

    
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
        formType: formType
      };


      if (formType === "visita") {
        await addDoc(collection(db, "registrosParteDeObra"), registro);
      }

      if (formType === "acta") {
        await addDoc(collection(db, "registrosActasDeReunion"), registro);
      }

      setFormData({
        observaciones: "",
        observacionesActividad: "",
        observacionesLocalizacion: "",
        fechaHora: "",
        imagenes: [],
        mediosDisponibles: [{ nombreEmpresa: "", numeroTrabajadores: "", maquinaria: "" }],
        previsionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
        observacionesActividades: { actividad1: "", actividad2: "", actividad3: "", actividad4: "", actividad5: "" },
      });
      setVisiblePrevisiones(1);
      setVisibleActivities(1);
      setSelectedActivities({});
      setSelectedSubactivities({});
      setActivityObservations({});

      fileInputsRefs.current.forEach((input) => {
        if (input) input.value = null;
      });

      setIsModalOpen(false);
      setModalSend(true);
      setMessageModalSend("Registro enviado");
      setErrorMessages([]); 

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
      maxSizeMB: 0.4, 
      maxWidthOrHeight: 2048,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      return file;
    }
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filteredLotes = lotes.filter(
    (l) =>
      (filters.sector === "" || l.sectorNombre === filters.sector) &&
      (filters.subSector === "" || l.subSectorNombre === filters.subSector) &&
      (filters.parte === "" || l.parteNombre === filters.parte) &&
      (filters.elemento === "" || l.elementoNombre === filters.elemento) &&
      (filters.nombre === "" || l.nombre === filters.nombre)
  );

  const handleGoBack = () => {
    navigate('/'); 
  };

  const labelMapping = {
    sector: "Grupo activos",
    subSector: "Activo",
    parte: "Inventario vial",
    elemento: "Componente",
    nombre: "Área inspección",
  };


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

        newSelected[actividadIndex].seleccionada = value === "si";
        newSelected[actividadIndex].subactividades = newSelected[actividadIndex].subactividades.map((sub) => ({
          ...sub,
          seleccionada: value === "si",
        }));
        newSelected[actividadIndex].noAplica = false;
      }

      return newSelected;
    });
  };



  const handleNoAplicaChange = (actividadIndex) => {
    setSelectedActivities((prev) => {
      const newSelected = { ...prev };

      if (!newSelected[actividadIndex]) {
        newSelected[actividadIndex] = {
          seleccionada: false,
          noAplica: true,
          subactividades: [],
        };
      } else {
        newSelected[actividadIndex].noAplica = !newSelected[actividadIndex].noAplica;

        if (newSelected[actividadIndex].noAplica) {
          newSelected[actividadIndex].seleccionada = false;
          newSelected[actividadIndex].subactividades = newSelected[actividadIndex].subactividades.map((sub) => ({
            ...sub,
            seleccionada: false,
          }));
          setActivityObservations((prev) => ({
            ...prev,
            [actividadIndex]: "", 
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
        [actividad]: value, 
      }
    }));
  };

  const toggleActivityVisibility = () => {
    setActivityVisibility((prev) => !prev);
  };

  // Función para guardar borrador en LocalStorage
  const saveDraft = () => {
    if (!selectedLote) {
      console.warn("No hay lote seleccionado para guardar borrador.");
      return;
    }

    const formState = {
      formData,
      selectedActivities,
      selectedSubactivities,
      activityObservations,
      observacionesImagenes,
      visibleActivities,
      visiblePrevisiones,
      // Otros estados que necesites guardar
    };

    try {
      localStorage.setItem(`parteObraDraft_${selectedLote.loteId}`, JSON.stringify(formState));
      alert("Borrador guardado exitosamente."); // Feedback simple al usuario
    } catch (error) {
      console.error("Error al guardar borrador en LocalStorage:", error);
      alert("Error al guardar borrador.");
    }
  };

  return (
    <div className="container mx-auto xl:px-14 py-2 text-gray-500 mb-10 min-h-screen">
      <div className="flex md:flex-row flex-col gap-2 items-center justify-between px-5 py-3 text-md">
    
        <div className="flex gap-2 items-center">
        
          <GoHomeFill className="hidden md:block" style={{ width: 15, height: 15, fill: "#d97706" }} />
          <Link to="#" className="hidden md:block font-medium text-gray-600">
            Home
          </Link>
          <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />
          <h1 className="hidden md:block font-medium">Ver registros</h1>
          <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />

         
          <h1 className="font-medium text-amber-600 px-2 py-1 rounded-lg">
            {selectedProjectName}
          </h1>
        </div>

 
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
                  Trabajos del coordinador
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold w-1/4">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...filteredLotes]
                .sort((a, b) => a.sectorNombre.localeCompare(b.sectorNombre)) 
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


            {/* Botones de tipos de formulario */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={handleVisitaClick}
                className={`px-4 py-2 rounded-lg ${formType === "visita" ? "bg-amber-600 border text-white font-medium" : "bg-white border text-gray-500"}`}
              >
                Informe de Visita
              </button>
              <button
                type="button"
                onClick={handleActaReunionClick}
                className={`px-4 py-2 rounded-lg ${formType === "acta" ? "bg-amber-600 border text-white font-medium" : "bg-white border text-gray-500"}`}
              >
                Acta de Reunión
              </button>
            </div>

            {/* ------------------------------------------------------- Formulario --------------------------------------------------*/}

            {/* Formulario visita*/}

            {formType === "visita" && (
              <div>
                <div>
                  <div>
                    <p className="font-semibold bg-sky-600 text-white rounded-t-lg px-4 py-2">
                      Trabajo seleccionado
                    </p>
                    {selectedLote && (
                      <p className="bg-gray-200 p-2 rounded-b-lg px-4 py-2 font-medium">{selectedLote.nombre}</p>
                    )}
                  </div>

                  {/* Fecha y Hora */}
                  <div>
                    <label className="mt-4 block bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Fecha y Hora
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="fechaHora"
                      value={formData.fechaHora}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>



                  <div>
                    {/* Observaciones de Actividad */}
                    <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">1. Trabajos inspeccionados</h3>
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium px-4">¿Qué actividades se inspeccionan?</label>

                      {visibleActivities < Object.keys(formData.observacionesActividades).length && (
                        <button
                          onClick={handleShowMoreActivities}
                          className="px-4 py-2 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Agregar actividad
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Observaciones de Actividades */}
                  <div className="mt-4">
                    {/* Botón para mostrar u ocultar las observaciones */}


                    {/* Sección de observaciones de actividades */}
                    <div className={`${activityVisibility ? "" : "hidden"} mt-4`}>
                      {Object.keys(formData.observacionesActividades)
                        .slice(0, visibleActivities)
                        .map((key, index) => (
                          <div key={index}>
                            <VoiceRecorderInput
                              maxLength={100}
                              name={`observacionesActividad-${key}`}
                              value={formData.observacionesActividades[key]}
                              onChange={(name, value) => handleActivityObservationChange(key, value)}
                              placeholder={`Actividad ${index + 1}`}
                            />
                          </div>
                        ))}
                    </div>




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
                      placeholder="Nº Trab."
                      value={empresa.numeroTrabajadores}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) => handleMediosChange(index, "numeroTrabajadores", e.target.value.replace(/\D/g, ""))}
                      className="block w-1/3 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    />

                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Maquinaria"
                      value={empresa.maquinaria}
                      onChange={(e) => handleMediosChange(index, "maquinaria", e.target.value)}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
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

                {/* Observaciones en materia seguridad y salud */}
                <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">3. Observaciones en materia de seguridad y salud</h3>

                <div>
                  <label className="mt-4 block bg-gray-200 px-4 py-2 rounded-md text-sm font-medium">
                    Observaciones generales
                  </label>
                  <VoiceRecorderInput
                    maxLength={600}
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}  // Actualizamos el estado de formData
                    placeholder="Escribe tus observaciones aquí..."
                  />
                </div>


                <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">4. Detalles de la inspección</h3>

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
                              value={activityObservations[actividadIndex] || ""} 
                              onChange={(name, value) => handleObservationChange(actividadIndex, value)}
                              placeholder="Escribe observaciones aquí..."
                              maxLength={150}
                              disabled={selectedActivities[actividadIndex]?.noAplica} 
                              className={selectedActivities[actividadIndex]?.noAplica ? "bg-gray-200 cursor-not-allowed" : ""} 
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


                {/* 5. Previsión de actividades de próximo inicio. Medias preventivas y pasos.*/}

                <div>
                  

                  <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">
                    5.  Previsión de actividades de próximo inicio y medidas preventivas.
                  </h3>

                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium px-4"><span className="text-amber-600 mr-2">*</span>Describe las observaciones necesarias</label>
                    {visiblePrevisiones < Object.keys(formData.previsionesActividades).length && (
                      <button
                        onClick={handleShowMorePrevisiones}
                        className="px-4 py-2 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Agregar previsión
                      </button>
                    )}
                  </div>

                  <div className="mt-2">
                    {Object.keys(formData.previsionesActividades)
                      .slice(0, visiblePrevisiones)
                      .map((key, index) => (
                        <div key={index}>
                          <VoiceRecorderInput
                            maxLength={200}
                            name={`previsionActividad-${key}`}
                            value={formData.previsionesActividades[key]}
                            onChange={(name, value) => handlePrevisionChange(key, value)}
                            placeholder={`Actividad prevista ${index + 1}`}
                          />
                        </div>
                      ))}
                  </div>



                </div>



                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                  <div className="mt-6">
                    <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">6. Reportaje fotográfico de la visita.</h3>
                    {/* Nota sobre imágenes en borrador (más concisa)*/}
                    <p className="text-sm text-amber-700 bg-amber-100 p-3 rounded-md mb-4 border border-amber-300">
                      Las imágenes *NO* se guardan en borrador. Si cargas un borrador, deberás volver a seleccionar las fotos antes de enviar.
                    </p>
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
                              className="hidden" 
                              id={`file-upload-${index}`}
                            />
                            <label
                              htmlFor={`file-upload-${index}`}
                              className={`block w-full text-sm text-gray-500 border border-gray-300 rounded-lg shadow-sm py-2 px-4 text-center cursor-pointer hover:bg-gray-50 ${
                                imageUploadStatus[index]?.status === 'compressing' ? 'bg-blue-100' :
                                imageUploadStatus[index]?.status === 'compressed' ? 'bg-green-100' :
                                imageUploadStatus[index]?.status === 'error' ? 'bg-red-100' : 'bg-indigo-100'
                              }`}
                            >
                              {imageUploadStatus[index]?.status === 'compressing' ? '⏳ Comprimiendo...' :
                               imageUploadStatus[index]?.status === 'compressed' ? '✅ Imagen lista' :
                               imageUploadStatus[index]?.status === 'error' ? '❌ Error' :
                               'Seleccionar archivo'}
                            </label>

                            {/* Preview de la imagen */}
                            {imagePreviews[index] && (
                              <div className="mt-2 relative">
                                <img
                                  src={imagePreviews[index]}
                                  alt={`Preview ${index}`}
                                  className="w-full h-48 object-contain rounded-lg border border-gray-200"
                                />
                                {imageUploadStatus[index]?.status === 'compressing' && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                    <div className="text-white text-sm">Comprimiendo...</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Mensaje de error */}
                            {imageErrors[index] && (
                              <div className="mt-2 text-red-500 text-sm">
                                {imageErrors[index]}
                              </div>
                            )}

                            {/* Campo para observaciones */}
                            <textarea
                              maxLength={50}
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

                  </div>

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
                    {/* Botón Guardar Borrador */}
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="w-1/3 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition mt-4"
                    >
                      Guardar Borrador
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
            )}

            {formType === "acta" && (
              <div>
                <div>
                  <div>
                    <p className="font-semibold bg-sky-600 text-white rounded-t-lg px-4 py-2">
                      Trabajo seleccionado
                    </p>
                    {selectedLote && (
                      <p className="bg-gray-200 p-2 rounded-b-lg px-4 py-2 font-medium">{selectedLote.nombre}</p>
                    )}
                  </div>

                  {/* Fecha y Hora */}
                  <div>
                    <label className="mt-4 block bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Fecha y Hora
                    </label>
                    <input
                      required
                      type="datetime-local"
                      name="fechaHora"
                      value={formData.fechaHora}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                </div>

                <h3 className="w-full bg-sky-600 text-white font-medium rounded-md px-4 py-2 my-4">4. Detalles de la inspección</h3>

                {ppiDetails && (
                  <div>


                    {/* Contenedor con scroll vertical */}
                    <div className="mt-4 ps-4">
                      {ppiDetails.actividades.map((actividad, actividadIndex) => {
                        
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
                              value={activityObservations[actividadIndex] || ""} 
                              onChange={(name, value) => handleObservationChange(actividadIndex, value)}
                              placeholder="Escribe observaciones aquí..."
                              maxLength={150}
                              disabled={selectedActivities[actividadIndex]?.noAplica} // 
                              className={selectedActivities[actividadIndex]?.noAplica ? "bg-gray-200 cursor-not-allowed" : ""} 
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
                    {/* Botón Guardar Borrador */}
                    <button
                      type="button"
                      onClick={saveDraft}
                      className="w-1/3 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition mt-4"
                    >
                      Guardar Borrador
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
            )}




          </div>
        </div>
      )
      }

      {
        modalSend && (
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
        )
      }


      {
        modalSend && (
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
        )
      }


    </div >
  );
};

export default ParteObra;
