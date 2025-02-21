import React, { useState } from "react";
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

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
});

const PdfInformeTablaRegistros = ({ registros, columnas, fechaInicio, fechaFin, fileName, formatFechaActual }) => {

  
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
    nombre: "Actividades mantenimiento, conservación, rehabilitación",
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
    await fetchUserDetails();

    const docContent = (
      <Document>
        {/* Páginas con registros */}
        {await Promise.all(
          registros.map(async (registro, index) => {
            const imagesWithMetadata = await fetchImagesWithMetadata(registro.imagenes || []);
            return (
              <Page key={index} size="A4" style={styles.page}>
                <EncabezadoInforme
                  empresa={proyecto?.empresa || "Mi Empresa"}
                  obra={proyecto?.obra || "Obra Desconocida"}
                  contrato={proyecto?.contrato || "Sin Contrato"}
                  description={proyecto?.descripcion || "Sin Descripción"}
                  rangoFechas={`${fechaInicio || formatFechaActual}${fechaFin ? ` al ${fechaFin}` : ""}`}
                  titlePdf="Formulario registro información"
                  subTitlePdf="Informe diario de inspección"
                  logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
                />
                <TituloInforme plantillaSeleccionada="Registro de actividades generales de mantenimiento y construccion del concesionario" />
                <DatosRegistro
                  registro={registro}
                  excluirClaves={[
                    "id",
                    "parteId",
                    "ppiId",
                    "idSubSector",
                    "idSector",
                    "idBim",
                    "elementoId",
                    "imagenes",
                    "observaciones",
                    "idProyecto",
                    "ppiNombre",
                    "loteid",
                    "totalSubactividades",
                    "nombreProyecto",
                    "estado",
                    "pkInicial",
                    "pkFinal",
                    "loteId",
                  ]}
                  columnasMap={columnasMap}
                />

                <GaleriaImagenes imagesWithMetadata={imagesWithMetadata} />
                <ObservacionesRegistro observaciones={registro.observaciones} />
              </Page>
            );
          })
        )}

        {/* Página final con la firma */}
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

    const blob = await pdf(docContent).toBlob();
    saveAs(blob, fileName);
  };

  return (
    <div>
      {proyectoLoading && <p>Cargando datos del proyecto...</p>}
      {proyectoError && <p>Error al cargar el proyecto: {proyectoError.message}</p>}
      {!proyectoLoading && !proyectoError && (
        <button
          onClick={downloadPdf}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center gap-4"
        >
          Descargar Informe PDF
        </button>
      )}
    </div>
  );
};

export default PdfInformeTablaRegistros;
