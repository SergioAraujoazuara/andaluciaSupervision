import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  sectionTitleMain: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "left",
    color: "#4b5563",
    backgroundColor: "#0284C7",
    color: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical:8,
    paddingLeft: 10,
    marginBottom:15,
    width:"536px"
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
    color: "#FFFFFF",
    backgroundColor: "#E5E7EB",
    padding: 5,
    paddingLeft: 10,
    width:"536px"
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
