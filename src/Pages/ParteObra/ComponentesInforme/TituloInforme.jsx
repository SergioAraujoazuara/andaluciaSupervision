import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  sectionTitleMain: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#cbd5e1",
    padding: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#E5E7EB",
    padding: 5,
    paddingLeft: 10,
    marginBottom: 10,
  },
});

/**
 * TituloInforme Component
 *
 * Renders the main title and active section for the report.
 *
 * @param {string} plantillaSeleccionada - Selected template name.
 * @param {string} activo - Active name.
 */
const TituloInforme = ({ plantillaSeleccionada, activo }) => (
  <View>
    <Text style={styles.sectionTitleMain}>{plantillaSeleccionada}</Text>
    
  </View>
);

export default TituloInforme;
