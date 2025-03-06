import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: "2px solid #cccccc",
    paddingBottom: 5,
  },
  headerInfo: {
    width: "65%",
    fontSize: 10,
    color: "#4b5563",
  },
  headerLabel: {
    fontWeight: "bold",
    color: "#4b5563",
  },
  headerValue: {
    color: "#4b5563",
    fontSize: 10,
    marginTop: 5,
  },
  headerLogos: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  logo: {
    width: 170,
    height: 70,
    marginBottom: 10,
  },
  line: {
    marginTop: 4,
    borderBottomWidth: 2,
    borderBottomColor: "#cccccc",
    width: "100%",
  },
});

const EncabezadoInforme = ({
  empresa,
  obra,
  contrato,
  description,
  rangoFechas,
  titlePdf,
  subTitlePdf,
  logos,
}) => (
  <View style={styles.header}>
    <View style={styles.headerInfo}>
      <Text style={styles.headerLabel}>{empresa}</Text>
      <View style={styles.line} />
      <Text style={styles.headerValue}>Obra: {obra}</Text>
      <Text style={styles.headerValue}>Identificaciñon documento: {contrato}</Text>
      <Text style={styles.headerValue}>Contratista: {description}</Text>
      <View style={styles.line} />
      <Text style={styles.headerValue}>Fecha: {rangoFechas}</Text>
      <Text style={styles.headerValue}>{titlePdf}</Text>
      <Text style={styles.headerValue}>Tipo documento: {subTitlePdf}</Text>
      <Text style={styles.headerValue}>Fecha y hora de visita: {localStorage.getItem('fechaVisita')} {localStorage.getItem('hora')}</Text>
      <Text style={styles.headerValue}>Número de visita: {localStorage.getItem('visitaNumero')}</Text>
    </View>
    <View style={styles.headerLogos}>
      {logos.map((logo, index) => (
        <Image key={index} src={logo} style={styles.logo} />
      ))}
    </View>
  </View>
);

export default EncabezadoInforme;
