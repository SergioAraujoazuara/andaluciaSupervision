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
import { FaCheck } from "react-icons/fa6";
import { MdOutlineError } from "react-icons/md";
import { BsClipboardData } from "react-icons/bs";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";


const ParteObra = () => {
  const navigate = useNavigate();
  const selectedProjectName = localStorage.getItem("selectedProjectName");
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState(null);
  const [formData, setFormData] = useState({
    observaciones: "",
    fechaHora: "",
    imagenes: [],
  });
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
  const [activityObservations, setActivityObservations] = useState({});


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
    setModalSend(false)
    setSelectedLote(null);
    setFormData({ observaciones: "", fechaHora: "", imagenes: [] });
    setSelectedLoteOption("")
    fileInputsRefs.current.forEach((input) => {
      if (input) input.value = null;
    });
  };

  // Manejar los cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const fileName = `${selectedProjectName}_${loteNombre}_${fechaActual}_${index}.jpg`
      .replace(/[/\\?%*:|"<>]/g, ""); // Eliminar caracteres no permitidos en nombres de archivo

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
      },
    };

    // Subir la imagen con los metadatos
    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLote) {
      console.error("No hay un lote seleccionado.");
      return;
    }

    try {
      // Subir imágenes válidas y generar URLs
      const imageUrls = await Promise.all(
        formData.imagenes
          .filter((image) => image) // Filtra imágenes no válidas antes de mapear
          .map(async (image, index) => await uploadImageWithMetadata(image, index))
      );

      // Crear el registro sin imágenes undefined o null
      const registro = {
        ...selectedLote,
        ...formData,
        imagenes: imageUrls,
        fechaHora: new Date(formData.fechaHora).toISOString(),
        actividad: selectedLoteOption,
      };

      // Guardar en Firebase
      await addDoc(collection(db, "registrosParteDeObra"), registro);
      console.log("Registro guardado con éxito:", registro);

      // Resetea los inputs y cierra el modal principal
      setFormData({ observaciones: "", fechaHora: "", imagenes: [] });
      setSelectedLoteOption("")
      fileInputsRefs.current.forEach((input) => {
        if (input) input.value = null;
      });
      setIsModalOpen(false);

      // Mostrar modal de éxito
      setModalSend(true);
      setMessageModalSend("Registro enviado");
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      setModalSend(true);
      setMessageModalSend("Error, revisa los datos antes de enviar.");
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


  // Manejar cambios en los checkboxes de subactividades
  const handleSubactivityChange = (actividadIndex, subIndex) => {
    setSelectedSubactivities((prev) => {
      const newSelected = { ...prev };
      const key = `${actividadIndex}-${subIndex}`;
      newSelected[key] = !newSelected[key]; // Alterna el estado del checkbox
      return newSelected;
    });
  };

  // Manejar cambios en el checkbox de actividad (Seleccionar todas las subactividades)
  const handleActivityChange = (actividadIndex, subactividades) => {
    setSelectedSubactivities((prev) => {
      const newSelected = { ...prev };
      const allChecked = subactividades.every((_, subIndex) => newSelected[`${actividadIndex}-${subIndex}`]);

      subactividades.forEach((_, subIndex) => {
        newSelected[`${actividadIndex}-${subIndex}`] = !allChecked; // Si todas están seleccionadas, las desmarca
      });

      return newSelected;
    });
  };

  // Manejar cambios en la observación de la actividad
  const handleObservationChange = (actividadIndex, value) => {
    setActivityObservations((prev) => ({
      ...prev,
      [actividadIndex]: value,
    }));
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
          {filteredLotes.map((lote) => (
            <div
              key={lote.loteId}
              className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-800">
                {lote.sectorNombre}
              </h3>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Subsector:</span> {lote.subSectorNombre}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Parte:</span> {lote.parteNombre}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Elemento:</span> {lote.elementoNombre}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-medium">Lote:</span> {lote.nombre}
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
          <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-lg relative max-h-[600px] max-w-[800px] overflow-y-auto">
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
            <p className="text-md">Mantenimiento, conservación, rehabilitación.</p>

            <div className="w-full border-b-2 mt-2 mb-6"></div>

            {
              ppiDetails && (
                <div>
                  <p className="text-lg font-semibold mb-2">Detalles del PPI</p>

                  {/* Contenedor con scroll vertical */}
                  <div className="max-h-[300px] overflow-y-auto border p-4 rounded-md bg-gray-50">
                    {ppiDetails.actividades.map((actividad, actividadIndex) => {
                      const allSubactivitiesChecked = actividad.subactividades.every(
                        (_, subIndex) => selectedSubactivities[`${actividadIndex}-${subIndex}`]
                      );

                      return (
                        <div key={actividadIndex} className="mb-4 border-b pb-3">
                          {/* Checkbox y título de la actividad */}
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allSubactivitiesChecked}
                              onChange={() => handleActivityChange(actividadIndex, actividad.subactividades)}
                              className="form-checkbox h-4 w-4 text-sky-600"
                            />
                            <p className="font-semibold text-sky-700">{actividad.numero}-</p>
                            <p className="font-semibold text-sky-700">{actividad.actividad}</p>
                          </div>

                          
                          {/* Lista de subactividades */}
                          {actividad.subactividades.map((sub, subIndex) => (
                            <div key={subIndex} className="ml-4 flex items-center gap-2 text-xs border-l-4 border-sky-500 pl-2 mt-2">
                              <input
                                type="checkbox"
                                checked={selectedSubactivities[`${actividadIndex}-${subIndex}`] || false}
                                onChange={() => handleSubactivityChange(actividadIndex, subIndex)}
                                className="form-checkbox h-3 w-3 text-sky-600"
                              />
                              <div>
                                <p className="text-gray-700 font-medium">{sub.numero} - {sub.nombre}</p>
                                <p className="text-gray-600 italic text-xs">Tipo: {sub.tipo_inspeccion}</p>
                              </div>
                            </div>
                          ))}

                          {/* Observaciones de la actividad */}
                          <textarea
                            value={activityObservations[actividadIndex] || ""}
                            onChange={(e) => handleObservationChange(actividadIndex, e.target.value)}
                            placeholder="Escribe observaciones aquí..."
                            className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                          />

                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            }



            {/* Título del modal */}
            <p className="text-sm font-semibold text-start my-2">
              Actividad
            </p>
            <select
              value={selectedLoteOption}
              onChange={(e) => setSelectedLoteOption(e.target.value)}
              className="border px-3 py-1 rounded-lg w-full"
            >
              <option value="" disabled>Selecciona una actividad</option>
              {loteOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>


            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones
                </label>
                <textarea
                  maxLength={700}
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  placeholder="Escribe tus observaciones aquí..."
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400 resize-none"
                ></textarea>
              </div>

              {/* Fecha y Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  name="fechaHora"
                  value={formData.fechaHora}
                  onChange={handleInputChange}
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Imágenes */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Imágenes (Mínimo 1)
                </label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <input
                        type="file"
                        accept="image/*"
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
                    </div>
                  ))}
                </div>
              </div>


              {/* Botones */}
              <div className="flex justify-between items-center gap-4">
                <button
                  type="submit"
                  className="w-2/3 py-2 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
                >
                  Enviar
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/3 py-2 bg-gray-400 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalSend && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-2xl shadow-xl relative flex flex-col justify-center items-center gap-3">
            {/* Botón de cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-800 transition"
              aria-label="Cerrar"
            >
              <IoClose />
            </button>

            {messageModalSend === 'Registro enviado' ? <FaCheck className="text-teal-500 text-3xl" /> : <MdOutlineError className="text-red-500 text-3xl" />}

            <p className="text-lg font-medium">{messageModalSend}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParteObra;
