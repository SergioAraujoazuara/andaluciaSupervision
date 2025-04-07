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
      
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
          <TituloInforme plantillaSeleccionada="2. Medios disponibles en obra: Empresas, trabajadores y maquinaria" />
        {dataRegister.mediosDisponibles.map((empresa, index) => {
          // 🧮 Calcular cuántas columnas usar
          const totalEmpresas = dataRegister.mediosDisponibles.length;
          let width = "100%"; // default 1 columna

          if (totalEmpresas > 1) width = "33.33%"; // 3 columnas
         

          return (
            <View
              key={index}
              style={{
                width,
                paddingRight: 4,
                marginBottom: 4,
              }}
            >
              <SeccionesDatosRegistros
                nombreCampo={`Nombre`}
                valorDelCampo={empresa.nombreEmpresa || "No especificado"}
              />
              <SeccionesDatosRegistros
                nombreCampo={`Número de trabajadores`}
                valorDelCampo={empresa.numeroTrabajadores || "No especificado"}
              />
            </View>
          );
        })}
      </View>





      {/* Sección 3 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="3. Observaciones en materia de seguridad y salud" />
        <SeccionesDatosRegistros
          nombreCampo={"Observaciones"}
          valorDelCampo={dataRegister.observaciones}
        />
      </View>

      
    </View>
  );
};

export default DatosRegistro;
