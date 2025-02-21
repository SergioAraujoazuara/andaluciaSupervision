import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { db } from "../../../firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { FaRegFilePdf } from "react-icons/fa6";
import { useAuth } from '../../context/authContext';
import { storage } from "../../../firebase_config";
import { ref, getMetadata } from "firebase/storage";
import EncabezadoInforme from "./ComponentesInforme/EncabezadoInforme";
import PiePaginaInforme from "./ComponentesInforme/PieDePaginaInforme";
import GaleriaImagenes from "./ComponentesInforme/GaleriaImagenes";
import DatosRegistro from "./ComponentesInforme/DatosRegistro";
import TituloInforme from "./ComponentesInforme/TituloInforme";
import ObservacionesRegistro from "./ComponentesInforme/ObservacionesRegistro";
import useProyecto from "../../Hooks/useProyectos";
import useUsuario from "../../Hooks/useUsuario";
import FechaHora from "./ComponentesInforme/FechaHora";


/**
 * PdfInforme Component
 *
 * Generates and downloads a PDF report for a construction project, including:
 * - Project details
 * - User information
 * - Images with metadata
 * - Observations and additional fields
 *
 * @param {Object[]} registros - Array of records for the report.
 * @param {string} [fechaInicial] - Start date for the report range.
 * @param {string} [fechaFinal] - End date for the report range.
 */


/**
 * Stylesheet for the PDF document.
 */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #cccccc",
    paddingBottom: 5,
  },
  headerInfo: {
    width: "65%",
    fontSize: 10,
    color: "#4b5563",
  },
  headerField: {
    flexDirection: "row",
    fontSize: 10,
    lineHeight: 2,
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  headerValue: {
    color: "#4b5563",
    fontSize: 10,
    marginTop: "5px",
  },
  headerLogos: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  logo: {
    width: 80,
    height: 50,
    marginLeft: 10,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#E5E7EB",
    padding: 5,
    paddingLeft: 10,
    marginBottom: 10

  },
  sectionTitleMain: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#eeeeee",
    padding: 10,
    margin: 0,
    paddingLeft: 10,

  },
  fieldColumn: {
    width: "30%", // Cada columna ocupa aproximadamente un tercio del ancho
    marginBottom: 5,
  },
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap", // Permitir que los elementos se ajusten en filas nuevas
    justifyContent: "space-between", // Distribuir columnas uniformemente
    marginBottom: 6,
    marginLeft: 8,
    marginTop: 20
  },
  fieldLabelGroup: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 10,
    marginBottom: 2,
    marginTop: 10,

  },
  fieldLabelGroupText: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 10,
    marginBottom: 2,

  },

  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 10,
    marginBottom: 2,

  },
  fieldLabelObservaciones: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 10,
    marginBottom: 5,
    lineHeight: 1.6,
  },
  fielId: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 10,
    marginLeft: 10
  },
  fieldValue: {
    color: "#4b5563",
    fontSize: 10,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginBottom: 2,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
  },
  image: {
    width: "45%",
    height: 170,
    margin: "0.8%",
    borderRadius: 8,
    border: "1px solid #cccccc",
  },
  footer: {
    marginTop: 40,
    paddingTop: 10,
    borderTop: "1px solid #cccccc",
    textAlign: "center",
    fontSize: 10,
    color: "#4b5563",
  },
  signature: {
    marginTop: 20,
    width: 150,
    height: 50,
    alignSelf: "center",
  },
  imageGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },
  imageContainer: {
    width: "45%",
    margin: "1%",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    border: "1px solid #cccccc",
    margin: 0
  },
  imageLink: {
    fontSize: 8,
    color: "#1d4ed8",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 5,
  },
  line: {
    marginTop: 4, // Espaciado superior
    borderBottomWidth: 2, // Grosor de la línea
    borderBottomColor: "#cccccc", // Color de la línea
    width: "100%", // Anchura completa
  },
  recordContainer: {
    border: "2px solid rgb(230, 230, 230)", // Borde alrededor del registro
    borderRadius: 5, // Bordes redondeados
    marginBottom: 20, // Separación entre registros
    marginTop: 40, // Separación adicional para la primera página
    backgroundColor: "#f9f9f9", // Fondo claro para mayor visibilidad
  },
  containerFecha: {
    fontSize: 10,
    backgroundColor: "#eeeeee",
    paddingTop: 15,
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  containerObservaciones: {
    backgroundColor: "#eeeeee",
    paddingTop: 15,
    paddingLeft: 10,
    borderRadius: 5,

  },
  line: {
    marginTop: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#cccccc",
    width: "100%",
  },
  signContainer: {
    marginTop: 50
  }
});

const PdfInformeImagenes = ({ registros, fechaInicial, fechaFinal, plantillaSeleccionada, filtrosAplicados }) => {
  console.log(filtrosAplicados)
  const { user } = useAuth();
  const { usuario, loading: userLoading, error: userError } = useUsuario(user?.uid);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [userNombre, setUserNombre] = useState('');
  const [userSignature, setUserSignature] = useState('');
  const titlePdf = 'Formulario registro información'
  const subTitlePdf = 'Informe diario de inspección'
  const [isModalOpen, setIsModalOpen] = useState(false); // Control del modal
  const [formData, setFormData] = useState({
    consecutivo: "",
    fechaEmision: "",
    fechaDeteccion: "",
    reportoDetecto: "",
    estacionReferencial: "",
    estacionInicial: "",
    estacionFinal: "",
    incumplimiento: "",
    indicadoresContractuales: "",
    detalle: "",
    registrosPrevios: "",
  }); // Datos del formulario

  // Abrir modal
  const openModal = () => setIsModalOpen(true);

  // Cerrar modal
  const closeModal = () => setIsModalOpen(false);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Guardar los datos del formulario y cerrar el modal
  const handleFormSubmit = (e) => {
    e.preventDefault();
    closeModal();
  };


  /**
 * Fetches the authenticated user's details (name and signature) from Firestore.
 */
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'usuarios', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data(); // Obtenemos los datos del documento
          setUserNombre(userData.nombre); // Establecemos el nombre del usuario
          setUserSignature(userData.signature); // Establecemos el nombre del usuario

          console.log(userData.nombre)
        }
      });
    } else {
      setUserNombre(''); // Limpia el estado si no hay usuario
      setUserSignature('');
    }
  }, [user]);

  // Función para descargar imágenes y obtener metadatos
  const fetchImagesWithMetadata = async (imagenes) => {
    return await Promise.all(
      imagenes.map(async (url) => {
        try {
          // Decodificar el path de la URL de Firebase
          const path = decodeURIComponent(url.split("/o/")[1].split("?")[0]);
          const imageRef = ref(storage, path);

          // Obtener metadatos de la imagen
          const metadata = await getMetadata(imageRef);
          const latitude = metadata.customMetadata?.latitude;
          const longitude = metadata.customMetadata?.longitude;

          // Descargar la imagen como Base64
          const response = await fetch(url);
          const blob = await response.blob();
          const imageBase64 = URL.createObjectURL(blob);

          // Generar enlace de Google Maps si hay coordenadas disponibles
          const googleMapsLink =
            latitude && longitude
              ? `https://www.google.com/maps?q=${latitude},${longitude}`
              : null;

          return { imageBase64, googleMapsLink };
        } catch (error) {
          console.error("Error al procesar la imagen:", error);
          return { imageBase64: null, googleMapsLink: null };
        }
      })
    );
  };

  /**
   * Generates default start and end dates (one week range).
   *
   * @returns {Object} - Object containing `startDate` and `endDate`.
   */
  const getDefaultDates = () => {
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);

    const formatDate = (date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`;

    return {
      startDate: formatDate(oneWeekAgo),
      endDate: formatDate(today),
    };
  };

  const { startDate, endDate } = getDefaultDates();
  const fechaInicioFinal = fechaInicial || startDate;
  const fechaFinFinal = fechaFinal || endDate;

  /**
   * Fetches project details from Firestore based on the stored project ID.
   */
  const selectedProjectId = localStorage.getItem("selectedProjectId");
  const { proyecto, loading: proyectoLoading, error: proyectoError } = useProyecto(selectedProjectId);




  /**
  * Generates a file name for the PDF based on project details and timestamp.
  *
  * @returns {string} - File name for the PDF.
  */
  const generateFileName = () => {
    const nombreProyecto = proyecto?.nombre_proyecto || "Proyecto";
    const nombreObra = proyecto?.obra || "Obra";
    const plantilla = "Plantilla"; // Puedes ajustarlo si tienes un valor dinámico para la plantilla
    const fechaHora = new Date().toISOString().replace(/:/g, "-").split(".")[0]; // Formato ISO con ":" reemplazado por "-" y sin milisegundos

    return `${nombreProyecto}_${nombreObra}_${plantilla}_${fechaHora}.pdf`;
  };



  // Ordenar registros por el campo "actividad"
  const sortedRegistros = [...registros].sort((a, b) => {
    if (a.actividad < b.actividad) return -1;
    if (a.actividad > b.actividad) return 1;
    return 0; // Si son iguales
  });


  const registrosPorActivo = sortedRegistros.reduce((acc, registro) => {
    const activo = registro.activo || "Sin Activo"; // Si no tiene activo, usar "Sin Activo"
    if (!acc[activo]) acc[activo] = [];
    acc[activo].push(registro);
    return acc;
  }, {});

  // Función para capitalizar la primera letra de un string
  const capitalizeFirstLetter = (str) => {
    if (!str) return ""; // Manejar casos en los que `str` sea null o undefined
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };


  useEffect(() => {
    const generatePdfBlob = async () => {
      const doc = (
        <Document>
          {/* Primera página: Información general */}
          <Page size="A4" style={styles.page}>
            <EncabezadoInforme
              empresa={proyecto?.empresa}
              obra={proyecto?.obra}
              contrato={proyecto?.contrato}
              description={proyecto?.descripcion}
              rangoFechas={`${fechaInicioFinal} - ${fechaFinFinal}`}
              titlePdf={titlePdf}
              subTitlePdf={subTitlePdf}
              logos={[proyecto?.logo, proyecto?.logoCliente].filter(Boolean)}
            />

            {/* Filtros aplicados */}
            <Text style={styles.sectionTitleMain}>Datos generales</Text>

            {/* Datos generales del formulario */}
            <View style={styles.fieldGroup}>
              {Object.entries(formData).map(([key, value], index) => (
                <View key={index} style={styles.fieldColumn}>
                  <Text style={styles.fieldLabelGroup}>{capitalizeFirstLetter(key.replace(/([A-Z])/g, " $1"))}:</Text>
                  <Text style={styles.fieldLabelGroupText}>{value || "No especificado"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.line} />

            <View style={styles.fieldGroup}>
              {Object.entries(filtrosAplicados).map(([filtro, valor], index) => (
                <View key={index} style={styles.fieldColumn}>
                  <Text style={styles.fieldLabelGroup}>{capitalizeFirstLetter(filtro)}:</Text>
                  <Text style={styles.fieldLabelGroupText}>{valor || "No especificado"}</Text>
                </View>
              ))}
            </View>

            <View style={styles.line} />

            {/* Pie de página */}
            <View style={styles.signContainer}>
              <PiePaginaInforme userNombre={userNombre} userSignature={userSignature} />
            </View>

          </Page>

          {/* Páginas con registros (2 por página) */}
          {await Promise.all(
            Object.entries(registrosPorActivo).flatMap(async ([activo, registros]) => {
              // Agrupar registros en pares de 2
              const registrosEnPares = registros.reduce((result, registro, index) => {
                if (index % 2 === 0) result.push([]);
                result[result.length - 1].push(registro);
                return result;
              }, []);

              return await Promise.all(
                registrosEnPares.map(async (parDeRegistros, index) => {
                  return (
                    <Page key={`${activo}-${index}`} size="A4" style={styles.page}>
                      {await Promise.all(
                        parDeRegistros.map(async (registro, subIndex) => {
                          const imagesWithMetadata = await fetchImagesWithMetadata(
                            registro.imagenes || []
                          );

                          return (
                            <View key={subIndex} style={styles.recordContainer}>
                              {/* Datos del registro */}
                              <View style={styles.containerFecha}>
                                <DatosRegistro
                                  registro={registro}
                                  excluirClaves={[
                                    "imagenes",
                                    "observaciones",
                                    "id",
                                    "proyectoId",
                                    "proyectoNombre",
                                    "activo",
                                    "area",
                                    "indicadores Asociados",
                                    "sección",
                                    "sentido",
                                    "subvalores_Activo",
                                    "tipo",
                                  ]}
                                />
                              </View>

                              {/* Galería de imágenes */}
                              <GaleriaImagenes imagesWithMetadata={imagesWithMetadata} />

                              {/* Observaciones */}
                              <View style={styles.containerObservaciones}>
                                <ObservacionesRegistro
                                  observaciones={registro.observaciones}
                                />
                              </View>
                            </View>
                          );
                        })
                      )}
                    </Page>
                  );
                })
              );
            })
          )}
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      setPdfBlob(blob);
    };

    generatePdfBlob();
  }, [registros, proyecto, fechaInicioFinal, fechaFinFinal, formData]);


  /**
     * Triggers the download of the generated PDF.
     */
  const downloadPdf = () => {
    if (pdfBlob) {
      const fileName = generateFileName();
      saveAs(pdfBlob, fileName);
    }
  };

  return (
    <div>


      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md shadow-md w-1/2 max-h-[80vh] overflow-y-auto">
            {/* Título del Modal */}
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Datos Generales</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {[
                { label: "Consecutivo", name: "consecutivo" },
                { label: "Fecha emisión", name: "fechaEmision" },
                { label: "Fecha detección", name: "fechaDeteccion" },
                { label: "Reportó / Detectó", name: "reportoDetecto" },
                { label: "Estación referencial", name: "estacionReferencial" },
                { label: "Estación inicial", name: "estacionInicial" },
                { label: "Estación final", name: "estacionFinal" },
                { label: "Incumplimiento", name: "incumplimiento" },
                { label: "Indicadores Contractuales", name: "indicadoresContractuales" },
                { label: "Detalle", name: "detalle" },
                { label: "Registros previos relacionados", name: "registrosPrevios" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block font-medium text-gray-700">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ))}

              {/* Botones */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botón para abrir el modal */}
      <button
        onClick={openModal}
        className="bg-gray-500 text-white px-4 py-2 rounded-md mb-4"
      >
        Datos del informe de hallazgo
      </button>
      <button
        onClick={downloadPdf}
        className="bg-sky-600 text-white px-4 py-2 rounded-md flex items-center gap-4 w-full flex justify-center"
      >
        Informe hallazgo <FaRegFilePdf />
      </button>
    </div>
  );
};

export default PdfInformeImagenes;
