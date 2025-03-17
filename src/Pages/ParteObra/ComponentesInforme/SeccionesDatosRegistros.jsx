import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  fieldRow: {
    marginBottom: 2,
    paddingHorizontal:8
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 2,
  },
  fieldLabelObservaciones: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 5,
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
      <Text style={styles.fieldLabel}>{nombreCampo}:</Text>
      <Text style={styles.fieldLabelObservaciones}>{valorDelCampo}</Text>
    </View>
  );
};

export default SeccionesDatosRegistros;
