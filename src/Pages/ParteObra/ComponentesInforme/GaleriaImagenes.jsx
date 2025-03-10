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
    width: "70%",
    height: 100,
    borderRadius: 8,
    border: "1px solid #cccccc",
    margin: 0,
  },
  imageLink: {
    fontSize: 8,
    color: "#1d4ed8",
    textDecoration: "underline",
    textAlign: "center",
    marginTop: 5,
  },
});

const GaleriaImagenes = ({ imagesWithMetadata }) => (
  <>

    <TituloInforme plantillaSeleccionada="6. Registro fotográfico" />
    <View style={styles.imageGrid}>
      {imagesWithMetadata.map((imageData, imgIndex) => (
        <View key={imgIndex} style={styles.imageContainer}>
          {imageData.imageBase64 && <Image style={styles.image} src={imageData.imageBase64} />}
          {imageData.googleMapsLink && (
            <>
             <Text style={styles.imageLink}>{imageData.googleMapsLink}</Text>
             <Text style={styles.imageLink}>{imageData.observacion}</Text>
             </>
           
          )}
        </View>
      ))}
    </View>
  </>

);

export default GaleriaImagenes;
