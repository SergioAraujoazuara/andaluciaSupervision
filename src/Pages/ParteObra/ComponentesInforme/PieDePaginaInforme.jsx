import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    marginTop: 40,
    paddingTop: 10,
    textAlign: "center",
    fontSize: 10,
    color: "#4b5563",
  },
  signature: {
    marginTop: 20,
    width: 150,
    height: 50,
    alignSelf: "center",
  },
});

const PiePaginaInforme = ({ userNombre, userSignature }) => (
  <View style={styles.footer}>
    <Text>Informe generado por:</Text>
    <Text>{userNombre || "N/A"}</Text>
    {userSignature && <Image src={userSignature} style={styles.signature} />}
  </View>
);

export default PiePaginaInforme;
