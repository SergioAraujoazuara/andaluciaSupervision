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
import ObservacionesRegistro from "./ComponentesInforme/SeccionesDatosRegistros";
import useProyecto from "../../Hooks/useProyectos";
import { AiOutlineClose } from "react-icons/ai";
import { FaFilePdf } from "react-icons/fa6";
import DatosRegistroTabla from "./ComponentesInforme/DatosRegistroTabla";
import Formulario from "../../Components/Firma/Formulario";
import Firma from "../../Components/Firma/Firma";
import { PDFDocument } from "pdf-lib";
import Spinner from "./ComponentesInforme/Spinner";
import { uploadPdfToStorage } from "../ParteObra/Helpers/uploadPdfToStorage";



const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
        backgroundColor: "#FFFFFF",
    },
});

const InformeFinal = ({ fechaInicio, fechaFin, formatFechaActual, nombreUsuario, registros }) => {

    console.log(registros, 'registros')

    const [modalOpen, setModalOpen] = useState(false);
    const [fechaVisita, setFechaVisita] = useState(localStorage.getItem("fechaVisita") || "");
    const [hora, setHora] = useState(localStorage.getItem("hora") || "");
    const [visitaNumero, setVisitaNumero] = useState(localStorage.getItem("visitaNumero") || "");
    const [firma, setFirma] = useState(null);  // Estado para la firma
    const [isGenerating, setIsGenerating] = useState(false); // Estado para el spinner
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSuccessModalMessage, setShowSuccessModalMessage] = useState('');

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




    const downloadPdf = async (registroIndividual) => {
        if (!registroIndividual) return null;

        let imagesWithMetadata = [];
        if (registroIndividual.imagenes && registroIndividual.imagenes.length > 0) {
            imagesWithMetadata = await fetchImagesWithMetadata(registroIndividual.imagenes);
        }

        const docContent = (
            <Document>
                <Page size="A4" style={styles.page}>
                    <EncabezadoInforme
                        empresa={proyecto?.empresa || "Mi Empresa"}
                        obra={proyecto?.obra || "Obra Desconocida"}
                        contrato={proyecto?.contrato || "Sin Contrato"}
                        description={proyecto?.descripcion || "Sin Descripción"}
                        rangoFechas={`${fechaInicio || formatFechaActual}${fechaFin ? ` al ${fechaFin}` : ""}`}
                        titlePdf="TPF GETINSA-EUROESTUDIOS S.L."
                        subTitlePdf="Tipo de documento Inspeccion de obra"
                        logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
                    />

                    <DatosRegistro
                        registro={registroIndividual}
                        excluirClaves={["id", "parteId", "ppiId", "idSubSector", "idSector", "idBim", "elementoId", "imagenes"]}
                        dataRegister={registroIndividual}
                        columnasMap={columnasMap}
                    />

                </Page>

                {imagesWithMetadata.length > 0 && (
                    <Page size="A4" style={styles.page}>
                        <GaleriaImagenes imagesWithMetadata={imagesWithMetadata} />
                        <PiePaginaInforme
                            userNombre={userNombre}
                            firmaEmpresa={registroIndividual.firmaEmpresa}
                            firmaCliente={registroIndividual.firmaCliente}
                            nombreUsuario={nombreUsuario}
                        />
                    </Page>
                )}


            </Document>
        );

        // Generamos el PDF y devolvemos el blob
        return await pdf(docContent).toBlob();
    };


    const handlegeneratePDF = async () => {
        if (!registros || registros.length === 0) {
            console.error("⚠️ No hay registros para generar el PDF");
            return;
        }

        console.log(`📄 Generando ${registros.length} informes...`);
        setIsGenerating(true); // Activar el spinner

        const pdfDoc = await PDFDocument.create(); // Creamos el documento final

        for (const registroIndividual of registros) {
            console.log(`📄 Creando informe para el registro ID: ${registroIndividual.id}`);

            const blob = await downloadPdf(registroIndividual);
            if (!blob) continue;

            const pdfBytes = await blob.arrayBuffer(); // Convertimos el blob a array buffer
            const tempPdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await pdfDoc.copyPages(tempPdf, tempPdf.getPageIndices());

            copiedPages.forEach((page) => pdfDoc.addPage(page)); // Añadimos las páginas al PDF final
        }

        // Guardamos el documento final como un blob
        const finalPdfBytes = await pdfDoc.save();
        const finalBlob = new Blob([finalPdfBytes], { type: "application/pdf" });

        // Descargamos el PDF
        const pdfURL = URL.createObjectURL(finalBlob);
        const link = document.createElement("a");
        link.href = pdfURL;
        link.download = "Informe_Final.pdf";
        link.click();

        // **Subimos el PDF al Storage**
        const downloadURL = await uploadPdfToStorage(finalBlob, selectedProjectId);
        if (downloadURL) {
            setShowSuccessModal(true); 
            setShowSuccessModalMessage('Informe guardado correctamente')// Mostrar el modal de éxito
        }

        setIsGenerating(false); // Desactivar el spinner

        console.log("✅ Informe final generado con éxito.");
    };










    return (
        <div>
            <div>
                <div>
                    {isGenerating ? (
                        <div className="flex justify-center items-center gap-2">
                            <Spinner /> {/* Spinner en lugar del botón */}
                            <span className="text-gray-500 text-xl font-medium">Generando...</span>
                        </div>
                    ) : (
                        <button
                            className="px-4 py-2 text-gray-500 text-xl font-medium rounded-md hover:text-sky-700 flex gap-2 items-center"
                            onClick={handlegeneratePDF}
                        >
                            <FaFilePdf /> Informe final
                        </button>
                    )}
                </div>
            </div>


            {/* Modal de Éxito */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center relative">
                        {/* Botón de Cierre */}
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
                            onClick={() => setShowSuccessModal(false)}
                        >
                            <AiOutlineClose size={20} />
                        </button>

                        {/* Contenido del Modal */}
                        <p className="text-4xl">✅</p>
                        <p className="text-gray-600 mt-4 font-medium">{showSuccessModalMessage}</p>

                        <div className="mt-10">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default InformeFinal;
