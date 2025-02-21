import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase_config";
import { BsClipboardData } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";

import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression"; // Importa la librería de compresión

/**
 * ParteObra Component
 *
 * A form for recording construction project data, including dynamic fields, images,
 * geolocation, and template selection.
 */

const ParteObra = () => {
  // State for managing form data and dynamic fields
  const [formData, setFormData] = useState({
    observaciones: "",
    imagenes: [],
    fechaHora: "",
  });
  // Resets file inputs to clear their values
  const fileInputsRefs = useRef([]);
  const resetFileInputs = () => {
    fileInputsRefs.current.forEach((input) => {
      if (input) {
        input.value = null; // Esto reinicia el valor del input
      }
    });
  };

  // Handles navigation back to the previous page
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navega hacia atrás en el historial
  };

  // State for templates and dynamic fields
  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [visibilidadCampos, setVisibilidadCampos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "success" o "error"
  const [fileInputKey, setFileInputKey] = useState(0);
  const [geolocalizacion, setGeolocalizacion] = useState(null);

  // Fetch user's geolocation when the component mounts
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



  // Load templates and dynamic fields from Firestore

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const plantillasSnapshot = await getDocs(collection(db, "plantillas"));
        const plantillasCargadas = plantillasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Prioritize a specific template
        const ordenadas = [
          ...plantillasCargadas.filter((p) => p.nombre === "Parte de obra"),
          ...plantillasCargadas.filter((p) => p.nombre !== "Parte de obra").sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          ),
        ];
        setPlantillas(ordenadas);

        const camposSnapshot = await getDocs(collection(db, "opcionesFormulario"));
        const camposCargados = camposSnapshot.docs.flatMap((doc) => doc.data().campos || []);
        setCamposDinamicos(camposCargados);

        const estadoInicial = camposCargados.reduce((estado, campo) => {
          estado[campo.nombre] = true;
          return estado;
        }, {});
        setVisibilidadCampos(estadoInicial);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);


  // Updates field visibility based on the selected template
  useEffect(() => {
    if (plantillaSeleccionada) {
      const camposPlantilla = plantillaSeleccionada.campos.map((campo) => campo.nombre);
      const nuevoEstado = camposDinamicos.reduce((estado, campo) => {
        estado[campo.nombre] = camposPlantilla.includes(campo.nombre);
        return estado;
      }, {});
      setVisibilidadCampos(nuevoEstado);
    }
  }, [plantillaSeleccionada, camposDinamicos]);

  // Handles template selection
  const handlePlantillaChange = (plantillaId) => {
    const plantilla = plantillas.find((p) => p.id === plantillaId);
    setPlantillaSeleccionada(plantilla || null);
  };

  // Converts a string to camel case
  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  };

  // Compresses an image using the compression library
  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    console.log("Compresion de imagen iniciada", file);
    return await imageCompression(file, options);
  };

  // Uploads an image to Firebase Storage with metadata
  const uploadImageWithMetadata = async (file, index) => {
    if (!geolocalizacion) {
      throw new Error("Geolocalización no disponible.");
    }

    const storageRef = ref(storage, `imagenes/${Date.now()}_${index}`);
    const metadata = {
      contentType: file.type,
      customMetadata: {
        latitude: geolocalizacion.lat.toString(),
        longitude: geolocalizacion.lng.toString(),
      },
    };

    await uploadBytes(storageRef, file, metadata);
    return await getDownloadURL(storageRef);
  };

  // Handles image selection and compression
  const handleFileChange = async (e, index) => {
    const files = [...formData.imagenes];
    const file = e.target.files[0];

    if (file) {
      console.log("Archivo seleccionado:", file);
      try {
        const compressedFile = await compressImage(file); // Comprimir la imagen
        files[index] = compressedFile;
        setFormData({ ...formData, imagenes: files }); // Actualizar el estado con la imagen comprimida
        console.log("Imagen comprimida:", compressedFile);
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
      }
    }
  };

  // Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!plantillaSeleccionada) {
      setModalMessage("Por favor, seleccione una plantilla antes de enviar.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    try {
      console.log("Enviando datos...");
      const imageUrls = await Promise.all(
        formData.imagenes.map(async (image, index) => {
          if (image) {
            console.log(`Subiendo imagen ${index + 1}...`);
            return await uploadImageWithMetadata(image, index); // Subir la imagen y obtener su URL
          }
          return null;
        })
      );
      console.log("URLs de imágenes obtenidas:", imageUrls);

      const formDataCamelCase = Object.keys(formData).reduce((acc, key) => {
        // Verificar si el campo es un subvalor
        if (key.startsWith("subvalores_")) {
          acc[key] = formData[key]; // Mantener el nombre del campo tal cual
        } else {
          // Convertir a camelCase para otros campos
          acc[key.charAt(0).toLowerCase() + key.slice(1)] = formData[key];
        }
        return acc;
      }, {});


      formDataCamelCase.imagenes = imageUrls.filter((url) => url !== null);

      // Recuperamos el ID y el nombre del proyecto desde el localStorage
      const selectedProjectId = localStorage.getItem("selectedProjectId");
      const selectedProjectName = localStorage.getItem("selectedProjectName");

      // Añadimos los datos del proyecto al formulario
      formDataCamelCase.proyectoId = selectedProjectId;
      formDataCamelCase.proyectoNombre = selectedProjectName;

      const nombreColeccion = `${toCamelCase(plantillaSeleccionada.nombre)}Form`;

      // Guardar en Firestore
      await addDoc(collection(db, nombreColeccion), formDataCamelCase);

      setModalMessage("Datos enviados con éxito.");
      setModalType("success");
      setModalVisible(true);

      // Resetear el formulario
      setFormData({ observaciones: "", imagenes: [], fechaHora: "" });
      resetFileInputs(); // Resetea los inputs de archivo
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      setModalMessage("Hubo un error al enviar los datos.");
      setModalType("error");
      setModalVisible(true);
    }
  };




  const closeModal = () => {
    setModalVisible(false);
    setModalMessage("");
    setModalType("");
  };


  const selectedProject = localStorage.getItem('selectedProjectName')

  return (
    <div className="min-h-screen container mx-auto xl:px-14 py-2 text-gray-500 mb-10">

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md text-center">
            <h3
              className={`text-lg font-semibold mb-4 ${modalType === "success" ? "text-green-600" : "text-red-600"
                }`}
            >
              {modalMessage}
            </h3>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-sky-600 text-white rounded-md shadow hover:bg-sky-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

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
          <h1 className="font-medium text-white bg-sky-600 px-4 py-1 rounded-lg">
            {selectedProject}
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


      <div className="w-11/12 max-w-4xl bg-white mx-auto ">

        <div className="px-6 py-6">
          <label className="block text-xl text-gray-500 font-medium mb-3 flex items-center gap-2 mb-4 border-b-4 py-4">
            <span>
              <BsClipboardData />
            </span>
            Formulario
          </label>
          <nav className="flex gap-4 flex-wrap">
            {plantillas.map((plantilla) => (
              <button
                key={plantilla.id}
                onClick={() => handlePlantillaChange(plantilla.id)}
                className={`py-2 px-6 text-sm font-medium rounded-full shadow-md transition-transform transform ${plantillaSeleccionada?.id === plantilla.id
                  ? "bg-sky-600 text-white scale-105 border border-sky-600"
                  : "bg-white text-sky-600 border border-sky-600 hover:bg-sky-600 hover:text-white hover:shadow-lg"
                  }`}
              >
                {plantilla.nombre}
              </button>
            ))}
          </nav>
        </div>

        {plantillaSeleccionada ?

          (
            <div className="px-8 pb-6">
  <form onSubmit={handleSubmit} className="space-y-8">
    {camposDinamicos
      .sort((a, b) => a.nombre.localeCompare(b.nombre))
      .map(
        (campo) =>
          visibilidadCampos[campo.nombre] && (
            <div key={campo.nombre}>
              <label className="block text-sm font-medium text-gray-800">
                {campo.nombre}
              </label>
              {campo.tipo === "desplegable" ? (
                <>
                  {/* Desplegable principal */}
                  <select
                    name={campo.nombre}
                    value={formData[campo.nombre] || ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;

                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        [campo.nombre]: selectedValue,
                      }));

                      // Verificar si el valor seleccionado tiene subvalores
                      const selectedOption = campo.valores.find(
                        (valor) => valor.valor === selectedValue
                      );

                      if (selectedOption && selectedOption.subvalores?.length) {
                        // Inicializar el subvalor seleccionado vacío
                        setFormData((prevFormData) => ({
                          ...prevFormData,
                          [`subvalores_${campo.nombre}`]: "",
                        }));
                      } else {
                        // Limpiar el subvalor si no hay subvalores disponibles
                        setFormData((prevFormData) => {
                          const { [`subvalores_${campo.nombre}`]: _, ...rest } =
                            prevFormData;
                          return rest;
                        });
                      }
                    }}
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">-- Seleccione una opción --</option>
                    {campo.valores.map((valor) => (
                      <option key={valor.id} value={valor.valor}>
                        {valor.valor}
                      </option>
                    ))}
                  </select>

                  {/* Desplegable dependiente (subvalores) */}
                  {formData[`subvalores_${campo.nombre}`] !== undefined && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-800">
                        Componente de {campo.nombre}
                      </label>
                      <select
                        name={`subvalores_${campo.nombre}`}
                        value={formData[`subvalores_${campo.nombre}`] || ""}
                        onChange={(e) =>
                          setFormData((prevFormData) => ({
                            ...prevFormData,
                            [`subvalores_${campo.nombre}`]: e.target.value,
                          }))
                        }
                        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                      >
                        <option value="">-- Seleccione una opción --</option>
                        {campo.valores
                          .find(
                            (valor) => valor.valor === formData[campo.nombre]
                          )
                          ?.subvalores?.map((subvalor) => (
                            <option key={subvalor.id} value={subvalor.valor}>
                              {subvalor.valor}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </>
              ) : campo.tipo === "texto" ? (
                <textarea
                  name={campo.nombre}
                  value={formData[campo.nombre] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [campo.nombre]: e.target.value })
                  }
                  className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
                ></textarea>
              ) : null}
            </div>
          )
      )}

    <div>
      <label className="block text-sm font-medium text-gray-800">
        Fecha y Hora
      </label>
      <input
        type="datetime-local"
        name="fechaHora"
        value={formData.fechaHora}
        onChange={(e) =>
          setFormData({ ...formData, fechaHora: e.target.value })
        }
        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-800">
        Observaciones
      </label>
      <textarea
        maxLength={750}
        name="observaciones"
        value={formData.observaciones}
        onChange={(e) =>
          setFormData({ ...formData, observaciones: e.target.value })
        }
        className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500"
      ></textarea>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-800">
        Imágenes
      </label>
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          type="file"
          accept="image/*"
          ref={(el) => (fileInputsRefs.current[index] = el)}
          onChange={(e) => handleFileChange(e, index)}
          className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
        />
      ))}
    </div>

    <button
      type="submit"
      className="w-full py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition"
    >
      Enviar
    </button>
  </form>
</div>

          )
          :
          (
            <div className="text-xl font-medium text-center mt-10">Selecciona una plantilla para visualizar el formulario</div>
          )}


      </div>




    </div >
  );
};

export default ParteObra;
