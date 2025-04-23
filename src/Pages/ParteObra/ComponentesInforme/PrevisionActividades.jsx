import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "column", // Asegura que cada sección use el ancho completo
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%", // Usa todo el ancho disponible
    marginBottom: 2,
  },
  section: {
    width: "100%", // Cada sección ocupa todo el ancho disponible
  },
  fieldRow: {
    flexDirection: "row",  // Usamos filas para las columnas
    flexWrap: "wrap",      // Asegura que los elementos se acomoden si se acaba el espacio
    marginBottom: 2,       // Espacio entre las filas
  },
  field: {
    width: "33.33%",
  },
});

const PrevisionActividades = ({ dataRegister }) => {
  const actividades = dataRegister.previsionesActividades
    ? Object.entries(dataRegister.previsionesActividades).filter(([_, valor]) => valor.trim() !== "")
    : [];

  if (actividades.length === 0) return null;

  return (
    <View style={styles.fieldGroup}>
    <View style={styles.section}>
      {/* Mapeamos las observaciones de actividades */}
      <View style={styles.fieldRow}>
        {Object.entries(dataRegister.previsionesActividades)
          .filter(([_, observacion]) => observacion.trim() !== "")  // Filtra las observaciones vacías
          .map(([actividadKey, observacion], index) => {
            // Formatear la clave como "Actividad 1", "Actividad 2", etc.
            const formattedKey = `Actividad: `; // Resultado: "Actividad 1"
            return (
              <View key={index} style={styles.field}>
                <SeccionesDatosRegistros
                  nombreCampo={formattedKey}  // Título de la actividad
                  valorDelCampo={observacion || "No especificado"}  // Valor de la observación
                />
              </View>
            );
          })}
      </View>
    </View>
  </View>
  );
};

export default PrevisionActividades;
