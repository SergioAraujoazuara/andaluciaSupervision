import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "column", // ⬅️ Asegura que cada sección use el ancho completo
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%", // ⬅️ Usa todo el ancho disponible
    marginBottom: 2,
  },
  section: {
    width: "100%", // ⬅️ Cada sección ocupa todo el ancho disponible
  },
});

const DatosRegistro = ({ dataRegister }) => {
  return (
    <View style={styles.fieldGroup}>
      {/* Sección 1 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="1. Trabajos inspeccionados" />
        <SeccionesDatosRegistros
          nombreCampo={"Observaciones actividad"}
          valorDelCampo={dataRegister.observacionesActividad}
        />
        <SeccionesDatosRegistros
          nombreCampo={"Observaciones localización"}
          valorDelCampo={dataRegister.observacionesLocalizacion}
        />
      </View>

      {/* Sección 2 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="2. Medios disponibles en obra: Empresas, trabajadores y maquinaria" />
        <SeccionesDatosRegistros
          nombreCampo={"Maquinaria"}
          valorDelCampo={dataRegister.mediosDisponibles.maquinaria}
        />
        <SeccionesDatosRegistros
          nombreCampo={"Nombre de la empresa"}
          valorDelCampo={dataRegister.mediosDisponibles.nombreEmpresa}
        />
        <SeccionesDatosRegistros
          nombreCampo={"Número de trabajadores"}
          valorDelCampo={dataRegister.mediosDisponibles.numeroTrabajadores}
        />
      </View>

      {/* Sección 3 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="3. Observaciones en materia de seguridad y salud" />
        <SeccionesDatosRegistros
          nombreCampo={"Observaciones"}
          valorDelCampo={dataRegister.observaciones}
        />
      </View>

      {/* Sección 4 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="4. Previsión de actividades de próximo inicio. Medias preventivas y pasos." />
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

export default DatosRegistro;
