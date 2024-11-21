import React, { useState, useEffect } from "react";
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#F5F5F5",
  },
  header: {
    marginBottom: 30,
    textAlign: "center",
    padding: 10,
    backgroundColor: "#007BFF",
    color: "white",
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    border: "1px solid #007BFF",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#007BFF",
    borderBottom: "1px solid #cccccc",
    paddingBottom: 5,
  },
  cardContent: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  fieldRow: {
    marginBottom: 5,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#333333",
    marginRight: 5,
  },
  fieldValue: {
    color: "#555555",
  },
  link: {
    color: "#007BFF",
    textDecoration: "none",
    fontSize: 10,
  },
});

const PdfInforme = ({ registros }) => {
  const [pdfBlob, setPdfBlob] = useState(null);

  useEffect(() => {
    const generatePdfBlob = async () => {
      const doc = (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>INFORME DE ESTADO DEL PROYECTO</Text>
              <Text style={{ fontSize: 12 }}>
                Fecha de Generación: {new Date().toLocaleDateString()}
              </Text>
            </View>

            {/* Sección: Resumen */}
            <Text style={styles.sectionTitle}>Resumen del Proyecto</Text>
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Detalles del Proyecto</Text>
              <View style={styles.cardContent}>
                <Text style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Nombre del Proyecto:</Text>
                  <Text style={styles.fieldValue}>Nombre Placeholder</Text>
                </Text>
                <Text style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Ubicación:</Text>
                  <Text style={styles.fieldValue}>Ubicación Placeholder</Text>
                </Text>
              </View>
            </View>

            {/* Sección: Registros */}
            <Text style={styles.sectionTitle}>Registros</Text>
            {registros.map((registro, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.cardHeader}>Registro #{index + 1}</Text>
                <View style={styles.cardContent}>
                  {Object.entries(registro).map(([key, value], i) => (
                    <View key={i} style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>{key.toUpperCase()}:</Text>
                      {key === "imagenes" && Array.isArray(value) ? (
                        value.map((link, linkIndex) => (
                          <Text key={linkIndex}>
                            <Link style={styles.link} src={link}>
                              {`Imagen ${linkIndex + 1}`}
                            </Link>
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.fieldValue}>
                          {Array.isArray(value) ? value.join(", ") : value || "N/A"}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </Page>
        </Document>
      );

      const blob = await pdf(doc).toBlob();
      setPdfBlob(blob);
    };

    generatePdfBlob();
  }, [registros]);

  const downloadPdf = () => {
    if (pdfBlob) {
      saveAs(pdfBlob, "informe_proyecto_profesional.pdf");
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
