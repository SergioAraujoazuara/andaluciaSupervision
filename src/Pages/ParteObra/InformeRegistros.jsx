import React, { useEffect, useState } from "react";
import { Document, Page, StyleSheet } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { useAuth } from "../../context/authContext";
import { db } from "../../../firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { ref, getDownloadURL, getMetadata } from "firebase/storage";
import { storage } from "../../../firebase_config";
import EncabezadoInforme from "./ComponentesInforme/EncabezadoInforme";
import PiePaginaInforme from "./ComponentesInforme/PieDePaginaInforme";
import TituloInforme from "./ComponentesInforme/TituloInforme";
import DatosRegistro from "./ComponentesInforme/DatosRegistro";
import GaleriaImagenes from "./ComponentesInforme/GaleriaImagenes";
import ObservacionesRegistro from "./ComponentesInforme/ObservacionesRegistro";
import useProyecto from "../../Hooks/useProyectos";
import { AiOutlineClose } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa6";
import DatosRegistroTabla from "./ComponentesInforme/DatosRegistroTabla";



const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
});

const PdfInformeTablaRegistros = ({ registros, columnas, fechaInicio, fechaFin, fileName, formatFechaActual, datosVisita, dataRegister, registro }) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [fechaVisita, setFechaVisita] = useState(localStorage.getItem("fechaVisita") || "");
  const [hora, setHora] = useState(localStorage.getItem("hora") || "");
  const [visitaNumero, setVisitaNumero] = useState(localStorage.getItem("visitaNumero") || "");

  // Guardar valores en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("fechaVisita", fechaVisita);
    localStorage.setItem("hora", hora);
    localStorage.setItem("visitaNumero", visitaNumero);
  }, [fechaVisita, hora, visitaNumero]);

  const handleSave = () => {
    setModalOpen(false); // Solo cierra el modal, los datos ya están en localStorage
  };





  const formatFechaSolo = (fecha) => {
    if (!fecha) return "";
    const fechaObj = new Date(fecha);
    const dia = fechaObj.getDate().toString().padStart(2, "0");
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, "0");
    const anio = fechaObj.getFullYear();

    return `${dia}/${mes}/${anio}`; // Devuelve solo DD/MM/YYYY
  };

  const [userNombre, setUserNombre] = useState("");
  const [userSignature, setUserSignature] = useState(null);
  const { user } = useAuth();


  const columnasMap = {
    fechaHora: "Fecha y hora",
    sectorNombre: "Grupo activos",
    subSectorNombre: "Activo",
    parteNombre: "Inventario vial",
    elementoNombre: "Componente",
    nombre: "Actividad",
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
    "observaciones",
  ];


  // Extraer el ID del proyecto almacenado en el localStorage
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const { proyecto, loading: proyectoLoading, error: proyectoError } = useProyecto(selectedProjectId);

  // Obtener detalles del usuario desde Firestore
  const fetchUserDetails = async () => {
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserNombre(userData.nombre || "Usuario desconocido");
          setUserSignature(userData.signature || null);
        }
      } catch (error) {
        console.error("Error al obtener detalles del usuario:", error);
      }
    }
  };




  // Descargar imágenes y metadatos
  const fetchImagesWithMetadata = async (imagePaths) => {
    return await Promise.all(
      imagePaths.map(async (path) => {
        try {
          const storageRef = ref(storage, path);
          const url = await getDownloadURL(storageRef);
          const metadata = await getMetadata(storageRef);
          const latitude = metadata.customMetadata?.latitude || null;
          const longitude = metadata.customMetadata?.longitude || null;

          const googleMapsLink =
            latitude && longitude
              ? `https://www.google.com/maps?q=${latitude},${longitude}`
              : null;

          return { imageBase64: url, googleMapsLink };
        } catch (error) {
          console.error(`Error al descargar la imagen ${path}:`, error);
          return null;
        }
      })
    );
  };



  const downloadPdf = async () => {
    console.log(dataRegister, 'valor del objeto');


    await fetchUserDetails();

    // Descargar imágenes antes de renderizar el PDF
    let imagesWithMetadata = [];
    if (dataRegister.imagenes && dataRegister.imagenes.length > 0) {
      imagesWithMetadata = await fetchImagesWithMetadata(dataRegister.imagenes);
    }

    const docContent = (
      <Document>
        {/* Página con los datos del único registro */}
        <Page size="A4" style={styles.page}>
          <EncabezadoInforme
            empresa={proyecto?.empresa || "Mi Empresa"}
            obra={proyecto?.obra || "Obra Desconocida"}
            contrato={proyecto?.contrato || "Sin Contrato"}
            description={proyecto?.descripcion || "Sin Descripción"}
            rangoFechas={`${fechaInicio || formatFechaActual}${fechaFin ? ` al ${fechaFin}` : ""}`}
            titlePdf="TPF GETINSA-EUROESTUDIOS S.L."
            subTitlePdf="Informativo ejecutivo"
            logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
          />

          <TituloInforme plantillaSeleccionada="Acta de inspección de coordinación de seguridad y salud" />

          <DatosRegistro
            registro={dataRegister}
            excluirClaves={[
              "id", "parteId", "ppiId", "idSubSector", "idSector", "idBim", "elementoId",
              "imagenes", "observaciones", "idProyecto", "ppiNombre", "loteid", "totalSubactividades",
              "nombreProyecto", "estado", "pkInicial", "pkFinal", "loteId",
              "sectorNombre", "subSectorNombre", "parteNombre", "elementoNombre"
            ]}
            columnasMap={columnasMap}
          />

       

          


        </Page>

        <Page size="A4" style={styles.page}>
          <DatosRegistroTabla
            registro={dataRegister}
            excluirClaves={[
              "id", "parteId", "ppiId", "idSubSector", "idSector", "idBim", "elementoId",
              "imagenes", "observaciones", "idProyecto", "ppiNombre", "loteid", "totalSubactividades",
              "nombreProyecto", "estado", "pkInicial", "pkFinal", "loteId",
              "sectorNombre", "subSectorNombre", "parteNombre", "elementoNombre"
            ]}
            columnasMap={columnasMap}
          />

          </Page>

        <Page size="A4" style={styles.page}>
          <EncabezadoInforme
            empresa={proyecto?.empresa || "Mi Empresa"}
            obra={proyecto?.obra || "Obra Desconocida"}
            contrato={proyecto?.contrato || "Sin Contrato"}
            description={proyecto?.descripcion || "Sin Descripción"}
            rangoFechas={`${fechaInicio || formatFechaActual}${fechaFin ? ` al ${fechaFin}` : ""}`}
            titlePdf="TPF GETINSA-EUROESTUDIOS S.L."
            subTitlePdf="Informativo ejecutivo"
            logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
          />
          {/* Insertar Galería de Imágenes solo si hay imágenes */}
          {imagesWithMetadata.length > 0 && (
            <GaleriaImagenes imagesWithMetadata={imagesWithMetadata} />
          )}

          <ObservacionesRegistro observaciones={dataRegister.observaciones} />
        </Page>

        {/* Página final con firma */}
        <Page size="A4" style={styles.page}>
          <EncabezadoInforme
            empresa={proyecto?.empresa || "Mi Empresa"}
            obra={proyecto?.obra || "Obra Desconocida"}
            contrato={proyecto?.contrato || "Sin Contrato"}
            description={proyecto?.descripcion || "Sin Descripción"}
            rangoFechas={`De ${fechaInicio || "N/A"} al ${fechaFin || "N/A"}`}
            titlePdf="Informe Final"
            subTitlePdf="Detalles Generales"
            logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
          />
          <PiePaginaInforme userNombre={userNombre} userSignature={userSignature} />
        </Page>
      </Document>
    );

    // Generar el PDF y abrirlo en una nueva pestaña
    const blob = await pdf(docContent).toBlob();
    const pdfURL = URL.createObjectURL(blob);
    window.open(pdfURL, "_blank");
  };


  const handlegeneratePDF = () => {
    if (!dataRegister || Object.keys(dataRegister).length === 0) {
      console.error("⚠️ No hay datos para generar el PDF");
      return;
    }

    setModalOpen(true); // Abre el modal

    setTimeout(() => {
      downloadPdf(); // Genera el PDF
    }, 200); // Espera un pequeño tiempo para asegurarse que `dataRegister` está listo

    setTimeout(() => {
      // Resetea las variables en localStorage
      localStorage.removeItem("fechaVisita");
      localStorage.removeItem("hora");
      localStorage.removeItem("visitaNumero");

      // Resetea los estados locales
      setFechaVisita("");
      setHora("");
      setVisitaNumero("");

      setModalOpen(false); // Cierra el modal
    }, 2000); // Espera 2 segundos antes de limpiar y cerrar
  };




  return (
    <div>
      {/* {proyectoLoading && <p>Cargando datos del proyecto...</p>}
      {proyectoError && <p>Error al cargar el proyecto: {proyectoError.message}</p>}
      {!proyectoLoading && !proyectoError && (
        <button
          onClick={downloadPdf}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center gap-4"
        >
          Descargar Informe PDF
        </button>
      )} */}

      <div>
        <div>
          {/* Botón para abrir el modal */}
          <button
            className="px-4 py-2 bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700 flex gap-2 items-center"
            onClick={() => setModalOpen(true)}
          >
            <FaFilePdf /> Generar informe
          </button>

          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Registrar Fecha de Visita</h2>
                  <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                    <AiOutlineClose size={24} />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Fecha de Visita</label>
                  <input
                    type="date"
                    value={fechaVisita}
                    onChange={(e) => setFechaVisita(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md border-gray-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Hora</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md border-gray-300"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Visita de Obra Nº</label>
                  <input
                    type="text"
                    value={visitaNumero}
                    onChange={(e) => setVisitaNumero(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md border-gray-300"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-5 py-2 text-gray-700 font-semibold bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleSave()
                      handlegeneratePDF()
                    }

                    }
                    className="px-5 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
};

export default PdfInformeTablaRegistros;
