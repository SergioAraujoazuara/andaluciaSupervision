import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";

const styles = StyleSheet.create({
  footer: {

    paddingTop: 10,
    fontSize: 9,
    color: "#4b5563",
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
   
    width: "100%",
 
  },
  leftColumn: {
    width: "50%",
    alignItems: "flex-start",
  },
  rightColumn: {
    width: "50%",
    alignItems: "flex-end",
  },
  signature: {
    width: 120,
    height: 50,
    marginTop: 10,
  },
  text: {
    marginBottom: 4,
  },
});

const PiePaginaInforme = ({ userNombre, firmaEmpresa, firmaCliente, nombreUsuario }) => (
  <View style={styles.footer}>
    <TituloInforme plantillaSeleccionada="7. Firmas" />
    <View style={styles.container}>

      {/* LADO IZQUIERDO */}
      <View style={styles.leftColumn}>
        <Text style={styles.text}>Enterado:</Text>
        <Text style={styles.text}>Por la Empresa Contratista Principal</Text>
        {firmaCliente ? (
          <Image src={firmaCliente} style={styles.signature} />
        ) : (
          <Text style={styles.text}>Firma no disponible</Text>
        )}
      </View>

      {/* LADO DERECHO */}
      <View style={styles.rightColumn}>
        <Text style={styles.text}>{nombreUsuario || "N/A"} - Coordinador de Seguridad y Salud</Text>
        <Text style={styles.text}></Text>
        <Text style={styles.text}>TPF Getinsa Euroestudios S.L.</Text>
        {firmaEmpresa ? (
          <Image src={firmaEmpresa} style={styles.signature} />
        ) : (
          <Text style={styles.text}>Firma no disponible</Text>
        )}
      </View>

    </View>
  </View>
);

export default PiePaginaInforme;
