import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase_config";
import imageCompression from "browser-image-compression";
import { fetchCampos } from "../../Pages/ParteObra/Helpers/firebaseHelpers";
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import GestionOpciones from "./GestionOpciones";

const ParteObra = () => {
  const [formType, setFormType] = useState("parteObra"); // Define el tipo de formulario
  const [formData, setFormData] = useState({
    observaciones: "",
    imagenes: [],
    geolocalizacion: null,
    motivo: "", // Campo adicional para incidencia
    estado: "Abierto", // Campo adicional para incidencia
  });

  const [camposDinamicos, setCamposDinamicos] = useState([]);
  const [docId, setDocId] = useState(null);
  const [visibilidadCampos, setVisibilidadCampos] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", message: "", type: "" });

  useEffect(() => {
    const cargarCampos = async () => {
      try {
        const { campos, docId } = await fetchCampos();
        setCamposDinamicos(campos || []);
        setDocId(docId);

        const estadoInicial = campos.reduce((estado, campo) => {
          estado[campo.id] = true; // Todos los campos visibles por defecto
          return estado;
        }, {});
        setVisibilidadCampos(estadoInicial);
      } catch (error) {
        mostrarModal("Error", "Error al cargar los campos dinámicos.", "error");
      }
    };

    cargarCampos();
  }, []);

  const mostrarModal = (title, message, type) => {
    setModalContent({ title, message, type });
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    return await imageCompression(file, options);
  };

  const uploadImageWithMetadata = async (file, index, geolocation) => {
    try {
      const storageRef = ref(storage, `imagenes/${Date.now()}_${index}`);
      const metadata = {
        contentType: file.type,
        customMetadata: {
          latitude: geolocation?.lat?.toString() || "Sin geolocalización",
          longitude: geolocation?.lng?.toString() || "Sin geolocalización",
        },
      };
      await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(storageRef);
    } catch (error) {
      mostrarModal("Error", "Error al subir la imagen con metadatos.", "error");
      throw error;
    }
  };

  const captureGeolocationForImage = async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => reject("No se pudo obtener la geolocalización.")
        );
      } else {
        reject("Geolocalización no soportada por el navegador.");
      }
    });
  };

  const handleFileChange = async (e, index) => {
    const files = [...formData.imagenes];
    const file = e.target.files[0];

    if (file) {
      try {
        const processedFile = await compressImage(file);
        const geolocation = await captureGeolocationForImage();
        files[index] = { file: processedFile, geolocation };
        setFormData({ ...formData, imagenes: files });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const imageUrls = await Promise.all(
        formData.imagenes.map(async (imageData, index) => {
          if (imageData?.file) {
            return await uploadImageWithMetadata(imageData.file, index, imageData.geolocation);
          }
          return null;
        })
      );

      const dataToSubmit = {
        observaciones: formData.observaciones,
        geolocalizacion: formData.geolocalizacion,
        imagenes: imageUrls.filter((url) => url !== null),
      };

      if (formType === "parteObra") {
        camposDinamicos.forEach((campo) => {
          if (visibilidadCampos[campo.id]) {
            const fieldName = toLowerCaseFirstLetter(campo.nombre);
            dataToSubmit[fieldName] = formData[campo.id] || "";
          }
        });
        await addDoc(collection(db, "registrosParteObra"), dataToSubmit);
      } else if (formType === "incidencia") {
        camposDinamicos.forEach((campo) => {
          if (visibilidadCampos[campo.id]) {
            const fieldName = toLowerCaseFirstLetter(campo.nombre);
            dataToSubmit[fieldName] = formData[campo.id] || "";
          }
        });
        dataToSubmit.motivo = formData.motivo;
        dataToSubmit.estado = formData.estado;
        await addDoc(collection(db, "incidencias"), dataToSubmit);
      }

      mostrarModal("Éxito", "Registro agregado correctamente.", "success");
      setFormData({
        observaciones: "",
        imagenes: [],
        geolocalizacion: null,
        motivo: "",
        estado: "Abierto",
      });
    } catch (error) {
      mostrarModal("Error", "Error al agregar el registro.", "error");
    }
  };

  const toLowerCaseFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toLowerCase() + string.slice(1);
  };

  return (
    <div className="container mx-auto min-h-screen px-6 py-8 text-gray-700 bg-white">
      <GestionOpciones />
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-600">Formulario de Registro</h2>

      {/* Botones para seleccionar formulario */}
      <div className="flex justify-center gap-6 mb-8">
        <button
          className={`px-4 py-2 rounded-md shadow-md font-medium transition ${
            formType === "parteObra"
              ? "bg-indigo-600 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setFormType("parteObra")}
        >
          Parte de Obra
        </button>
        <button
          className={`px-4 py-2 rounded-md shadow-md font-medium transition ${
            formType === "incidencia"
              ? "bg-indigo-600 text-white"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }`}
          onClick={() => setFormType("incidencia")}
        >
          Incidencia
        </button>
      </div>

      {/* Controles de visibilidad */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Campos disponibles</h3>
        <div className="flex flex-wrap gap-4 mt-4">
          {camposDinamicos.map((campo) => (
            <button
              key={campo.id}
              onClick={() =>
                setVisibilidadCampos((prevState) => ({
                  ...prevState,
                  [campo.id]: !prevState[campo.id],
                }))
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-md font-medium transition ${
                visibilidadCampos[campo.id]
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              {visibilidadCampos[campo.id] ? <FaEye /> : <FaEyeSlash />}
              {campo.nombre}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos dinámicos */}
        {(formType === "parteObra" || formType === "incidencia") &&
          camposDinamicos.map(
            (campo) =>
              visibilidadCampos[campo.id] && (
                <div key={campo.id}>
                  <label className="block text-sm font-medium text-gray-800">{campo.nombre}</label>
                  <select
                    name={campo.id}
                    value={formData[campo.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [campo.id]: e.target.value })}
                    required
                    className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">-- Seleccione una opción --</option>
                    {campo.valores.map((valor) => (
                      <option key={valor.id} value={valor.valor}>
                        {valor.valor}
                      </option>
                    ))}
                  </select>
                </div>
              )
          )}

          {/* Campos adicionales para incidencia */}
        {formType === "incidencia" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-800">Motivo</label>
              <textarea
                name="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
                className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Abierto">Abierto</option>
                <option value="En proceso">En proceso</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>
          </>
        )}

        {/* Campos comunes */}
        <div>
          <label className="block text-sm font-medium text-gray-800">Observaciones</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            required
            className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800">Imágenes</label>
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, index)}
              className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
            />
          ))}
        </div>

        

        <button
          type="submit"
          className="px-4 py-2 bg-amber-600 text-white rounded-md shadow-md hover:bg-amber-700 w-full"
        >
          Enviar
        </button>
      </form>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-96">
            <h3
              className={`text-lg font-semibold mb-4 ${
                modalContent.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {modalContent.type === "success" && <FaCheckCircle className="inline mr-2" />}
              {modalContent.type === "error" && <FaExclamationCircle className="inline mr-2" />}
              {modalContent.title}
            </h3>
            <p className="text-sm">{modalContent.message}</p>
            <button
              onClick={cerrarModal}
              className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParteObra;
