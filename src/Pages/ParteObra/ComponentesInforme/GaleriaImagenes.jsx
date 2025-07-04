import React from "react";
import { View, Image, Text, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";

const styles = StyleSheet.create({
  imageGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
  },
  imageContainer: {
    width: "45%",
    margin: "1%",
    alignItems: "center",
  },
  image: {
    width: "95%",
    height: 130,
    borderRadius: 8,
    border: "1px solid #cccccc",
    margin: 0,
  },
  imageLink: {
    fontSize: 8,
    color: "#5F6B75",
    textAlign: "center",
    marginTop: 2,
    textDecoration: "underline",
  },
  imageText: {
    fontSize: 8,
    color: "#5F6B75",
    textAlign: "center",
    marginTop: 2,
    
  },
});

const GaleriaImagenes = ({ imagesWithMetadata, mostrarTitulo = true }) => (
  <>
    {mostrarTitulo && <TituloInforme plantillaSeleccionada="2. ANEXO: Registro fotográfico" />}
    <View style={styles.imageGrid}>
      {imagesWithMetadata.map((imageData, imgIndex) => (
        <View key={imgIndex} style={styles.imageContainer}>
          {imageData.imageBase64 && <Image style={styles.image} src={imageData.imageBase64} />}
          {imageData.googleMapsLink && (
            <>
              <Text style={styles.imageLink}>{imageData.googleMapsLink}</Text>
              <Text style={styles.imageText}>{imageData.observacion}</Text>
            </>
          )}
        </View>
      ))}
    </View>
  </>
);

export default GaleriaImagenes;
