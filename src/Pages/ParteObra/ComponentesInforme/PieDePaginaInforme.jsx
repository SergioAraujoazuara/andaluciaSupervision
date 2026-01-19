import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";

const styles = StyleSheet.create({
  footer: {
    fontSize: 8,
    color: "#4b5563",
    paddingHorizontal:"8",
    marginTop:20
  },
  containerDual: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  containerSingle: {
    flexDirection: "row",
    justifyContent: "center",
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
  rightColumnCentered: {
    width: "100%",
    alignItems: "center",
  },
  signature: {
    width: 100,
    height: 40,
  },
  text: {
    marginBottom: 2,
  },
});

const PiePaginaInforme = ({ userNombre, firmaEmpresa, firmaCliente, nombreUsuario, requiereContratistaFirma = true, requiereCoordinadorFirma = true }) => {
  // Verificar si hay al menos una firma para mostrar
  const tieneFirmaCoordinador = firmaEmpresa && requiereCoordinadorFirma;
  const tieneFirmaContratista = firmaCliente && requiereContratistaFirma;
  const tieneAlgunaFirma = tieneFirmaCoordinador || tieneFirmaContratista;

  // Si no hay ninguna firma, no mostrar nada
  if (!tieneAlgunaFirma) {
    return null;
  }

  return (
    <View style={styles.footer}>
      <TituloInforme plantillaSeleccionada="4. Firmas" />
      <View style={requiereContratistaFirma && tieneFirmaContratista ? styles.containerDual : styles.containerSingle}>

        {/* LADO IZQUIERDO - Solo mostrar si se requiere y hay firma de contratista */}
        {requiereContratistaFirma && tieneFirmaContratista && (
          <View style={styles.leftColumn}>
            <Text style={styles.text}>Enterado:</Text>
            <Text style={styles.text}>Por la Empresa Contratista Principal</Text>
            <Image src={firmaCliente} style={styles.signature} />
          </View>
        )}

        {/* LADO DERECHO - Solo mostrar si hay firma del coordinador */}
        {tieneFirmaCoordinador && (
          <View style={requiereContratistaFirma && tieneFirmaContratista ? styles.rightColumn : styles.rightColumnCentered}>
            <Text style={styles.text}>{nombreUsuario || "N/A"} - Supervisor</Text>
            <Text style={styles.text}></Text>
            <Text style={styles.text}>TPF Getinsa Euroestudios S.L.</Text>
            <Image src={firmaEmpresa} style={styles.signature} />
          </View>
        )}

      </View>
    </View>
  );
};

export default PiePaginaInforme;
