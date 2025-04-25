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
    width: "33.33%", // Ancho de cada columna (para 3 columnas)
  },
  singleField: {
    width: "100%",  // Si solo hay 1 actividad, ocupará el 100% del ancho
  },
});

const PrevisionActividades = ({ dataRegister }) => {
  const actividades = dataRegister.previsionesActividades
    ? Object.entries(dataRegister.previsionesActividades).filter(([_, valor]) => valor.trim() !== "")
    : [];

  if (actividades.length === 0) return null;

  // Si hay solo 1 actividad, usamos singleField
  const isSingleActivity = actividades.length === 1;

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.section}>
        {/* Mapeamos las observaciones de actividades */}
        <View style={styles.fieldRow}>
          {actividades.map(([actividadKey, observacion], index) => {
            // Formatear la clave como "Actividad: "
            const formattedKey = `Actividad: `; // Resultado: "Actividad 1"
            return (
              <View
                key={index}
                style={isSingleActivity ? styles.singleField : styles.field} // Condicional para 1 actividad o más
              >
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
