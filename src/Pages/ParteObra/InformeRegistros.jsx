import React, { useEffect, useState } from "react";
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
import ObservacionesRegistro from "./ComponentesInforme/SeccionesDatosRegistros";
import useProyecto from "../../Hooks/useProyectos";
import { AiOutlineClose } from "react-icons/ai";
import { FaFilePdf, FaBan } from "react-icons/fa6";
import DatosRegistroTabla from "./ComponentesInforme/DatosRegistroTabla";
import Formulario from "../../Components/Firma/Formulario";
import Firma from "../../Components/Firma/Firma";
import Spinner from "./ComponentesInforme/Spinner";

import { View, Text, Image, StyleSheet, Page, Document } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  line: {
    marginTop: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#cccccc",
    width: "100%",
  },
});

const PdfInformeTablaRegistros = ({ registros, columnas, fechaInicio, fechaFin, fileName, formatFechaActual, datosVisita, dataRegister, registro, nombreUsuario }) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [fechaVisita, setFechaVisita] = useState(localStorage.getItem("fechaVisita") || "");
  const [hora, setHora] = useState(localStorage.getItem("hora") || "");
  const [visitaNumero, setVisitaNumero] = useState(localStorage.getItem("visitaNumero") || "");
  const [firma, setFirma] = useState(null);  // Estado para la firma
  const [isGenerating, setIsGenerating] = useState(false); // Estado para el spinner
  const handleSave = () => {
    localStorage.setItem("firma", firma);  // Guardar la firma en localStorage
    setModalOpen(false);
  };



  // Guardar valores en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("fechaVisita", fechaVisita);
    localStorage.setItem("hora", hora);
    localStorage.setItem("visitaNumero", visitaNumero);
  }, [fechaVisita, hora, visitaNumero]);







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
  const selectedProjectName = localStorage.getItem("selectedProjectName");
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
          const observacion = metadata.customMetadata?.observacion || null;

          const googleMapsLink =
            latitude && longitude
              ? `https://www.google.com/maps?q=${latitude},${longitude}`
              : null;

          return { imageBase64: url, googleMapsLink, observacion };
        } catch (error) {
          console.error(`Error al descargar la imagen ${path}:`, error);
          return null;
        }
      })
    );
  };



  const downloadPdf = async () => {
    console.log(dataRegister, 'valor del objeto');

    if (!dataRegister?.firmaEmpresa || !dataRegister?.firmaCliente) {
      console.error("⚠️ No hay firmas guardadas en Firestore.");
      return; // Evita continuar si no hay firmas en Firestore
    }
    

    if (userNombre !== "NA") {
      await fetchUserDetails();
    }


    // Descargar imágenes antes de renderizar el PDF
    let imagesWithMetadata = [];
    if (dataRegister.imagenes && dataRegister.imagenes.length > 0) {
      imagesWithMetadata = await fetchImagesWithMetadata(dataRegister.imagenes);
      console.log(imagesWithMetadata, 'imagenes ******+')
    }

    const docContent = (
      <Document>
        {/* Página con los datos del único registro */}
        <Page size="A4" style={styles.page}>
          <EncabezadoInforme
            empresa={proyecto?.empresa || "Nombre de mpresa"}
            obra={proyecto?.obra || "Nombre de obra"}
            promotor={proyecto?.promotor || "Promotor"}
            description={proyecto?.descripcion || "Contratista"}
            coordinador={proyecto?.coordinador || "Nombre coordinador de seguridad y salud"}
            director={proyecto?.director || "Nombre director de la obra"}
            rangoFechas={`${fechaInicio || formatFechaActual}${fechaFin ? ` al ${fechaFin}` : ""}`}
            logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
          />



          <DatosRegistro
            registro={dataRegister}
            excluirClaves={[
              "id", "parteId", "ppiId", "idSubSector", "idSector", "idBim", "elementoId",
              "imagenes", "idProyecto", "ppiNombre", "loteid", "totalSubactividades",
              "nombreProyecto", "estado", "pkInicial", "pkFinal", "loteId",
              "sectorNombre", "subSectorNombre", "parteNombre", "elementoNombre"
            ]}
            dataRegister={dataRegister}
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


          {/* Insertar Galería de Imágenes solo si hay imágenes */}
          {imagesWithMetadata.length > 0 && (
            <GaleriaImagenes imagesWithMetadata={imagesWithMetadata} />
          )}


          {/* Pie de página con ambas firmas */}
          <PiePaginaInforme
            userNombre={userNombre}
            firmaEmpresa={dataRegister.firmaEmpresa}  // Firma de la empresa desde Firestore
            firmaCliente={dataRegister.firmaCliente}
            nombreUsuario={nombreUsuario} // Firma del cliente desde Firestore
          />

        </Page>


      </Document>
    );

     // Generar el PDF como Blob y abrir en una nueva pestaña
const blob = await pdf(docContent).toBlob();
const pdfURL = URL.createObjectURL(blob);
window.open(pdfURL, "_blank");


  };


  const handlegeneratePDF = () => {
    if (!dataRegister || Object.keys(dataRegister).length === 0) {
      console.error("⚠️ No hay datos para generar el PDF");
      return;
    }
    setIsGenerating(true)
    setModalOpen(true); // Abre el modal

    setTimeout(() => {
      downloadPdf(); // Genera el PDF
    }, 200); // Espera un pequeño tiempo para asegurarse que `dataRegister` está listo

    setTimeout(() => {
      // Resetea las variables en localStorage
      localStorage.removeItem("fechaVisita");
      localStorage.removeItem("hora");
      localStorage.removeItem("visitaNumero");


      setIsGenerating(false)
      setModalOpen(false); // Cierra el modal
    }, 2000); // Espera 2 segundos antes de limpiar y cerrar
  };




  return (
    <div>
      {isGenerating ? (
        <div className="flex justify-center items-center gap-2">
          <Spinner /> {/* Spinner en lugar del botón */}
        </div>
      ) : (
        <button
          className={`w-10 h-10 flex justify-center items-center text-xl font-medium rounded-md ${dataRegister.firmaEmpresa && dataRegister.firmaCliente
              ? "text-gray-500 hover:text-sky-700"
              : "text-gray-500 cursor-not-allowed"
            }`}
          onClick={dataRegister.firmaEmpresa && dataRegister.firmaCliente ? handlegeneratePDF : null}
          disabled={!dataRegister.firmaEmpresa || !dataRegister.firmaCliente} // Si no hay firmas, deshabilitar
        >
          {dataRegister.firmaEmpresa && dataRegister.firmaCliente ? (
            <FaFilePdf className="w-6 h-6" />
          ) : (
            <FaBan className="w-6 h-6" />
          )}
        </button>
      )}
    </div>
  );

};

export default PdfInformeTablaRegistros;
