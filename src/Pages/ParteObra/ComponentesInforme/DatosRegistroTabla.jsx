import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
    marginLeft: 8,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    width: "100%",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    padding: 5,
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 4,
    width: "100%",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "start",
    color: "#374151",
    paddingHorizontal: 14,
  },
  tableCell: {
    fontSize: 9,
    textAlign: "start",
    color: "#4B5563",
    paddingHorizontal: 14,
    paddingVertical:14,
    wordWrap: "break-word",
  },
  tableCellSmall: {
    width: "25%", // 🔹 Primeras dos columnas ocupan el 25%
  },
  tableCellLarge: {
    width: "50%", // 🔹 La columna Observación ocupa el 50%
  },
  subActividadRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 3,
    width: "100%",
  },
  subActividadCell: {
    fontSize: 8,
    textAlign: "center",
    color: "#4B5563",
    paddingHorizontal: 4,
    wordWrap: "break-word",
  },
  resultadoVisita: {
    marginTop: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
    textAlign: "center",
  },
  resultadoTexto: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "#374151",
  },
});

const DatosRegistroTabla = ({ registro }) => {
  return (
    <View style={styles.fieldGroup}>
      <TituloInforme plantillaSeleccionada="5. Detalles de la inspección" />

      {/* 🔹 Tabla de Actividades y Subactividades */}
      {registro.actividades && (
        <View style={styles.tableContainer}>
          {/* Encabezado de la Tabla */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, styles.tableCellSmall]}>Actividad</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellSmall]}>Estado</Text>
            <Text style={[styles.tableCellHeader, styles.tableCellLarge]}>Observación</Text>
          </View>

          {/* 🔥 Filtrar y mostrar solo actividades seleccionadas */}
          {Object.values(registro.actividades)
            .filter((actividad) => actividad.seleccionada === true)
            .map((actividad, index) => {
              return (
                <View key={index}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.tableCellSmall]}>
                      {actividad.nombre || `Actividad ${index + 1}`}
                    </Text>
                    <Text
                      style={[
                        styles.tableCell,
                        styles.tableCellSmall,
                        { color: "green", fontWeight: "bold" },
                      ]}
                    >
                      Aplica ✅
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellLarge]}>
                      {actividad.observacion || "—"}
                    </Text>
                  </View>

                  {/* Subactividades */}
                  {actividad.subactividades &&
                    actividad.subactividades.filter((sub) => sub.seleccionada === true).length > 0 && (
                      <>
                        <View style={styles.subActividadRow}>
                          <Text style={[styles.subActividadCell, styles.tableCellSmall, { fontWeight: "bold" }]}>
                            Subactividades
                          </Text>
                          <Text style={[styles.subActividadCell, styles.tableCellSmall]}></Text>
                          <Text style={[styles.subActividadCell, styles.tableCellLarge]}></Text>
                        </View>
                        {actividad.subactividades
                          .filter((sub) => sub.seleccionada === true)
                          .map((subactividad, subIndex) => {
                            return (
                              <View key={subIndex} style={styles.subActividadRow}>
                                <Text style={[styles.subActividadCell, styles.tableCellSmall]}>
                                  {subactividad.nombre || `Subactividad ${subIndex + 1}`}
                                </Text>
                                <Text
                                  style={[
                                    styles.subActividadCell,
                                    styles.tableCellSmall,
                                    { color: "green", fontWeight: "bold" },
                                  ]}
                                >
                                  Aplica ✅
                                </Text>
                                <Text style={[styles.subActividadCell, styles.tableCellLarge]}>
                                  {subactividad.observacion || "—"}
                                </Text>
                              </View>
                            );
                          })}
                      </>
                    )}
                </View>
              );
            })}
        </View>
      )}

      {/* 🔹 Resultado de la Visita */}
      {/* <View style={styles.resultadoVisita}>
        <Text style={styles.resultadoTexto}>
          Resultado de la Visita:{" "}
          <Text
            style={{
              color: registro.apto === "apto" ? "green" : "red",
              fontWeight: "bold",
              fontSize: 10,
            }}
          >
            {registro.apto === "apto" ? "APTO ✅" : "NO APTO ❌"}
          </Text>
        </Text>
      </View> */}
      
    </View>
  );
};

export default DatosRegistroTabla;
