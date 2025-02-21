import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  fieldRow: {
    marginBottom: 10,
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
 * ObservacionesRegistro Component
 *
 * Displays the observations for a specific record.
 *
 * @param {string} observaciones - Observations text for the record.
 */
const ObservacionesRegistro = ({ observaciones }) => {
  if (!observaciones) return null;

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>OBSERVACIONES:</Text>
      <Text style={styles.fieldLabelObservaciones}>{observaciones}</Text>
    </View>
  );
};

export default ObservacionesRegistro;
