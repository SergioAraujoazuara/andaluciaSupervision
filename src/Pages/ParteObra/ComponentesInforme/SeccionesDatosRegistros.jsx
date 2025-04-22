import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  fieldRow: {
    marginBottom: 2,
    paddingHorizontal: 8,
    flexDirection: "column", // ✅ Campo y valor en línea
    alignItems: "flex-start",
    flexWrap: "wrap", 
    marginBottom:8    // Permite que el texto largo se acomode
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: "4"
           // Espacio entre campo y valor
  },
  fieldLabelObservaciones: {
    fontWeight: "normal",
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.6,
  },
});

/**
 * SeccionesDatosRegistros Component
 *
 * Muestra un campo con su clave y su valor desde Firestore.
 *
 * @param {string} nombreCampo - La clave del campo en Firestore.
 * @param {string} valorDelCampo - El contenido del campo.
 */
const SeccionesDatosRegistros = ({ nombreCampo, valorDelCampo }) => {
  if (!valorDelCampo) return null;

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{nombreCampo}</Text>
      <Text style={styles.fieldLabelObservaciones}>{valorDelCampo}</Text>
    </View>
  );
};

export default SeccionesDatosRegistros;
