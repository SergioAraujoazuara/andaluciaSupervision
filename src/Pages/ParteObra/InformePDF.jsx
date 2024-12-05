import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { db } from "../../../firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { FaRegFilePdf } from "react-icons/fa6";
import { useAuth } from '../../context/authContext';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #94a3b8",
    paddingBottom: 10,
  },
  headerInfo: {
    width: "65%",
    fontSize: 12,
    color: "#4b5563",
  },
  headerField: {
    flexDirection: "row",
    fontSize: 12,
    lineHeight: 2,
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  headerValue: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: "5px",
  },
  headerLogos: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-start",
    width: "45%",
  },
  logo: {
    width: 80,
    height: 50,
    marginLeft: 10,
  },
  card: {
    padding: 20,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 5,
  },
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 5,
    marginLeft: "10px"
  },
  fieldColumn: {
    width: "48%",
    marginBottom: 5,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 10,
    marginBottom: 5,
  },
  fieldValue: {
    color: "#4b5563",
    fontSize: 10,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginBottom: 5,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
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
});

const PdfInforme = ({ registros, fechaInicial, fechaFinal }) => {
  const { user } = useAuth();
  const [pdfBlob, setPdfBlob] = useState(null);
  const [imagenesBase64, setImagenesBase64] = useState([]);
  const [proyecto, setProyecto] = useState(null);
  const [userNombre, setUserNombre] = useState('');
  const [userSignature, setUserSignature] = useState('');

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

  useEffect(() => {
    const fetchProyecto = async () => {
      const idProyecto = localStorage.getItem("idProyecto");
      if (!idProyecto) {
        console.error("No se encontró el ID del proyecto en localStorage.");
        return;
      }

      const proyectoRef = doc(db, "proyectos", idProyecto);
      const proyectoSnap = await getDoc(proyectoRef);

      if (proyectoSnap.exists()) {
        setProyecto(proyectoSnap.data());
      } else {
        console.error("No se encontró el proyecto en la base de datos.");
      }
    };

    fetchProyecto();
  }, []);

  const generateFileName = () => {
    const nombreProyecto = proyecto?.nombre_proyecto || "Proyecto";
    const nombreObra = proyecto?.obra || "Obra";
    const plantilla = "Plantilla"; // Puedes ajustarlo si tienes un valor dinámico para la plantilla
    const fechaHora = new Date().toISOString().replace(/:/g, "-").split(".")[0]; // Formato ISO con ":" reemplazado por "-" y sin milisegundos

    return `${nombreProyecto}_${nombreObra}_${plantilla}_${fechaHora}.pdf`;
  };

  useEffect(() => {
    const fetchImagenes = async () => {
      const allImages = await Promise.all(
        registros.flatMap((registro) =>
          registro.imagenes.map(async (url) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return URL.createObjectURL(blob);
          })
        )
      );
      setImagenesBase64(allImages);
    };

    fetchImagenes();
  }, [registros]);

  useEffect(() => {
    const generatePdfBlob = async () => {
      const doc = (
        <Document>
          {registros.map((registro, index) => (
            <Page key={index} size="A4" style={styles.page}>
              {/* Encabezado */}
              <View style={styles.header}>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerLabel}>
                    Línea de alta velocidad Vitoria-Bilbao-San Sebastián
                  </Text>
                  <Text style={styles.headerValue}>
                    Tramo: Mondragón-Elorrio-Bergara
                  </Text>
                  <Text style={styles.headerValue}>
                    Rango de fechas: {fechaInicioFinal} - {fechaFinFinal}
                  </Text>
                </View>
                <View style={styles.headerLogos}>
                  {proyecto?.logo && (
                    <Image src={proyecto.logo} style={styles.logo} />
                  )}
                  {proyecto?.logoCliente && (
                    <Image src={proyecto.logoCliente} style={styles.logo} />
                  )}
                </View>
              </View>

              {/* Título de la sección */}
              <Text style={styles.sectionTitle}>
                Registro número: {registro.id}
              </Text>

              {/* Datos en columnas */}
              <View style={styles.fieldGroup}>
                {Object.entries(registro)
                  .filter(([key]) => key !== "imagenes" && key !== "observaciones" && key !== "id")
                  .map(([key, value], i) => {
                    // Verificar si el texto tiene más de 5 palabras
                    const isLongText =
                      typeof value === "string" && value.split(" ").length > 5;

                    return (
                      <View
                        key={i}
                        style={[
                          isLongText ? styles.fullRow : styles.fieldColumn, // Usar estilos diferentes según la longitud del texto
                        ]}
                      >
                        <Text style={styles.fieldLabel}>{key.toUpperCase()}:</Text>
                        <Text style={styles.fieldValue}>
                          {Array.isArray(value) ? value.join(", ") : value || "N/A"}
                        </Text>
                      </View>
                    );
                  })}
              </View>


              {/* Imágenes */}
              <View>
                {registro.imagenes && Array.isArray(registro.imagenes) && (
                  <View>
                    {registro.imagenes.map((_, imgIndex) => (
                      imgIndex % 2 === 0 && (
                        <View key={imgIndex} style={styles.imageRow}>
                          <Image
                            style={styles.image}
                            src={imagenesBase64[imgIndex]}
                          />
                          {imagenesBase64[imgIndex + 1] && (
                            <Image
                              style={styles.image}
                              src={imagenesBase64[imgIndex + 1]}
                            />
                          )}
                        </View>
                      )
                    ))}
                  </View>
                )}
              </View>

              {/* Observaciones */}
              {registro.observaciones && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>OBSERVACIONES:</Text>
                  <Text style={styles.fieldValue}>
                    {registro.observaciones}
                  </Text>
                </View>
              )}
            </Page>
          ))}

          {/* Página final con la firma */}
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <View style={styles.headerInfo}>
                <Text style={styles.headerLabel}>
                  Línea de alta velocidad Vitoria-Bilbao-San Sebastián
                </Text>
                <Text style={styles.headerValue}>
                  Tramo: {proyecto?.tramo || "N/A"}
                </Text>
                <Text style={styles.headerValue}>
                  Rango de fechas: {fechaInicioFinal} - {fechaFinFinal}
                </Text>
              </View>
              <View style={styles.headerLogos}>
                {proyecto?.logo && (
                  <Image src={proyecto.logo} style={styles.logo} />
                )}
                {proyecto?.logoCliente && (
                  <Image src={proyecto.logoCliente} style={styles.logo} />
                )}
              </View>
            </View>
            <View style={styles.footer}>
              <Text>Informe generado por:</Text>
              <Text>{userNombre}</Text>
              {userSignature && <Image src={userSignature} style={styles.signature} />}
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      setPdfBlob(blob);
    };

    if (imagenesBase64.length > 0) {
      generatePdfBlob();
    }
  }, [registros, imagenesBase64, proyecto, fechaInicioFinal, fechaFinFinal]);

  const downloadPdf = () => {
    if (pdfBlob) {
      const fileName = generateFileName();
      saveAs(pdfBlob, fileName);
    }
  };

  return (
    <div>
      <button
        onClick={downloadPdf}
        className="bg-amber-600 text-white px-4 py-2 rounded-md flex items-center gap-4"
      >
        Generar informe <FaRegFilePdf />
      </button>
    </div>
  );
};

export default PdfInforme;
