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
      <TituloActividad plantillaSeleccionada={`Actividad: ${dataRegister.actividad}`} />

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

      {/* Sección 2 - Medios Disponibles en Obra */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="2. Medios disponibles en obra: Empresas, trabajadores y maquinaria" />

        {/* Verifica si hay empresas registradas */}
        {dataRegister.mediosDisponibles && dataRegister.mediosDisponibles.length > 0 ? (
          dataRegister.mediosDisponibles.map((empresa, index) => (
            <View key={index} style={{ marginBottom: 1 }}>
              <SeccionesDatosRegistros
                nombreCampo={`Nombre`}
                valorDelCampo={empresa.nombreEmpresa || "No especificado"}
              />
              <SeccionesDatosRegistros
                nombreCampo={`Número de trabajadores`}
                valorDelCampo={empresa.numeroTrabajadores || "No especificado"}
              />
            </View>
          ))
        ) : (
          <SeccionesDatosRegistros
            nombreCampo={"Empresas en obra"}
            valorDelCampo={"No hay empresas registradas"}
          />
        )}
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
