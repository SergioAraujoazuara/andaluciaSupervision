import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { db } from "../../../firebase_config";
import { doc, getDoc } from "firebase/firestore";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 10,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "1px solid #94a3b8",
    paddingBottom: 10,
  },
  headerInfo: {
    width: "65%",
    fontSize: 10,
  },
  headerField: {
    marginBottom: 2,
    flexDirection: "row",
    fontSize: 10,
    lineHeight: 1.5,
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#000000",
  },
  headerValue: {
    color: "#555555",
    fontSize: 10,
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
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
    marginTop: 5,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#475569",
    borderBottom: "1px solid #cccccc",
    paddingBottom: 5,
    marginBottom:"15px"
  },
  dynamicFieldsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  dynamicField: {
    width: "48%", // Ajusta esto para definir el tamaño de cada columna
    marginBottom: 10
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#333333",
    fontSize: 10,
  },
  fieldValue: {
    color: "#555555",
    fontSize: 9,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginTop:"2px"
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: "45%",
    height: 170,
    margin: "1.5%",
    borderRadius: 8,
    border: "1px solid #cccccc",
  },
  fieldRow: {
    marginBottom: 2,
  },
});

const PdfInforme = ({ registros }) => {
  const [pdfBlob, setPdfBlob] = useState(null);
  const [imagenesBase64, setImagenesBase64] = useState([]);
  const [proyecto, setProyecto] = useState(null);

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
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerInfo}>
                  <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Obra: </Text>
                    <Text style={styles.headerValue}>
                      {proyecto?.obra || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Tramo: </Text>
                    <Text style={styles.headerValue}>
                      {proyecto?.tramo || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.headerField}>
                    <Text style={styles.headerLabel}>Fecha: </Text>
                    <Text style={styles.headerValue}>
                      {new Date().toLocaleDateString()}
                    </Text>
                  </View>
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

              {/* Registro */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>
                  Registro número: {registro.id}
                </Text>

                {/* Campos dinámicos */}
                <View style={styles.dynamicFieldsContainer}>
                  {Object.entries(registro)
                    .filter(
                      ([key]) =>
                        key !== "imagenes" &&
                        key !== "observaciones" &&
                        key !== "id"
                    )
                    .map(([key, value], i) => (
                      <View key={i} style={styles.dynamicField}>
                        <Text style={styles.fieldLabel}>{key.toUpperCase()}:</Text>
                        <Text style={styles.fieldValue}>
                          {Array.isArray(value) ? value.join(", ") : value || "N/A"}
                        </Text>
                      </View>
                    ))}
                </View>

                {/* Imágenes */}
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

                {/* Campo OBSERVACIONES */}
                {registro.observaciones && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>OBSERVACIONES:</Text>
                    <Text style={styles.fieldValue}>{registro.observaciones}</Text>
                  </View>
                )}
              </View>
            </Page>
          ))}
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      setPdfBlob(blob);
    };

    if (imagenesBase64.length > 0) {
      generatePdfBlob();
    }
  }, [registros, imagenesBase64, proyecto]);

  const downloadPdf = () => {
    if (pdfBlob) {
      saveAs(pdfBlob, "informe_proyecto.pdf");
    }
  };

  return (
    <div>
      <button
        onClick={downloadPdf}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Descargar Informe PDF
      </button>
    </div>
  );
};

export default PdfInforme;
