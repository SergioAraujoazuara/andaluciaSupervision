import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
    marginLeft: 8,
  },
  fieldColumn: {
    width: "100%",
    marginBottom: 5,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 2,
  },
  fieldValue: {
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginBottom: 2,
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    width: "100%", // Asegura que la tabla use todo el ancho disponible
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
    flex: 1,
    textAlign: "start",
    color: "#374151",
    paddingHorizontal: 4, // Agrega un poco de espacio a los lados
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    textAlign: "start",
    color: "#4B5563",
    paddingHorizontal: 4,
    minWidth: "25%", // Evita que las columnas colapsen
    maxWidth: "33%", // Controla el ancho máximo
    wordWrap: "break-word", // Asegura que el texto no se desborde
  },
  subActividadRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 3,
    width: "100%",
  },
  subActividadCell: {
    fontSize: 8,
    flex: 1,
    textAlign: "center",
    color: "#4B5563",
    paddingHorizontal: 4,
    minWidth: "25%",
    maxWidth: "33%",
    wordWrap: "break-word",
  },
  aptoText: {
    fontSize: 12, // 🔹 Se agranda el texto (ajusta el tamaño según tu preferencia)
    fontWeight: "bold", // 🔹 Negrita para resaltar más
    textTransform: "uppercase", // 🔹 Asegura que siempre esté en mayúsculas
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

const convertirFechaISOaVisual = (fechaISO) => {
  if (!fechaISO) return "N/A";
  const fecha = new Date(fechaISO);
  return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${fecha.getFullYear()} ${fecha.getHours()
      .toString()
      .padStart(2, "0")}:${fecha.getMinutes()
        .toString()
        .padStart(2, "0")}:${fecha.getSeconds().toString().padStart(2, "0")}`;
};

const columnasMap = {
  apto: "Resultado visita",
  fechaHora: "Fecha y hora",
  sectorNombre: "Grupo activos",
  subSectorNombre: "Activo",
  parteNombre: "Inventario vial",
  elementoNombre: "Componente",
  actividad: "Actividad",
  observaciones: "Observaciones",
  actividadesProximoInicio: "Actividades Próximo Inicio",
  controlAccesos: "Control de Accesos",
  controlSiniestraidad: "Control de Siniestralidad",
  controlSubcontratacion: "Control de Subcontratación",
  medidasPreventivas: "Medidas Preventivas",
  observacionesActividad: "Observaciones Actividad",
  observacionesLocalizacion: "Ubicación",
  registroEmpresas: "Registro de Empresas",
};

const ordenColumnas = [
  "fechaHora",
  "sectorNombre",
  "subSectorNombre",
  "parteNombre",
  "elementoNombre",
  "actividad",
  "observaciones",
  "actividadesProximoInicio",
  "controlAccesos",
  "controlSiniestraidad",
  "controlSubcontratacion",
  "medidasPreventivas",
  "observacionesActividad",
  "observacionesLocalizacion",
  "registroEmpresas",
];

const DatosRegistroTabla = ({ registro, excluirClaves = [] }) => {
  return (
    <View style={styles.fieldGroup}>
     


      {/* 🔹 Sección de Actividades y Subactividades */}
      {registro.actividades && (
        <View style={styles.tableContainer}>
          {/* Encabezado de la Tabla */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Actividad</Text>
            <Text style={styles.tableCellHeader}>Estado</Text>
            <Text style={styles.tableCellHeader}>Observación</Text>
          </View>

          {/* 🔥 Filtrar actividades para ocultar "No Aplica" y "No Cumple" */}
          {Object.values(registro.actividades)
            .filter((actividad) => actividad.seleccionada === true) // 🔥 Solo muestra actividades "Aplica"
            .map((actividad, index) => {
              return (
                <View key={index}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{actividad.nombre || `Actividad ${index + 1}`}</Text>
                    <Text style={[styles.tableCell, { color: "green", fontWeight: "bold" }]}>
                      Aplica ✅
                    </Text>
                    <Text style={styles.tableCell}>{actividad.observacion || "—"}</Text>
                  </View>

                  {/* Subactividades (🔹 También ocultamos las que no aplican o no cumplen) */}
                  {actividad.subactividades &&
                    actividad.subactividades.filter((sub) => sub.seleccionada === true).length > 0 && (
                      <>
                        <View style={styles.subActividadRow}>
                          <Text style={[styles.subActividadCell, { fontWeight: "bold" }]}>
                            Subactividades
                          </Text>
                          <Text style={styles.subActividadCell}></Text>
                          <Text style={styles.subActividadCell}></Text>
                        </View>
                        {actividad.subactividades
                          .filter((sub) => sub.seleccionada === true) // 🔥 Solo subactividades que "Aplican"
                          .map((subactividad, subIndex) => {
                            return (
                              <View key={subIndex} style={styles.subActividadRow}>
                                <Text style={styles.subActividadCell}>
                                  {subactividad.nombre || `Subactividad ${subIndex + 1}`}
                                </Text>
                                <Text style={[styles.subActividadCell, { color: "green", fontWeight: "bold" }]}>
                                  Aplica ✅
                                </Text>
                                <Text style={styles.subActividadCell}>
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

      {/* 🔹 Resultado de la Visita - Agregado debajo de la tabla */}
      <View style={styles.resultadoVisita}>
        <Text style={styles.fieldValue} >
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
      </View>




    </View>
  );
};

export default DatosRegistroTabla;
