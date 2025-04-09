import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";
import TituloActividad from "./TituloActividad";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "column", // ⬅️ Asegura que cada sección use el ancho completo
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%", // ⬅️ Usa todo el ancho disponible
  },
  section: {
    width: "100%", // ⬅️ Cada sección ocupa todo el ancho disponible
  },
});

const MedidasPreventivas = ({ dataRegister }) => {
  return (
    <View style={styles.fieldGroup}>
      
      {/* Sección 7 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="6. Previsión de actividades de próximo inicio. Medias preventivas y pasos." />
        <SeccionesDatosRegistros
          nombreCampo={"Actividades próximo inicio"}
          valorDelCampo={dataRegister.actividadesProximoInicio}
        />
        <SeccionesDatosRegistros
          nombreCampo={"Medidas preventivas"}
          valorDelCampo={dataRegister.medidasPreventivas}
        />
      </View>
    </View>
  );
};

export default MedidasPreventivas;
