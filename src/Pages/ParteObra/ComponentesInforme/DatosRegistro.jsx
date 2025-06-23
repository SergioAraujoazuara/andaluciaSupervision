import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";
import TituloActividad from "./TituloActividad";
import ObservacionesActividades from "./ObservacionesActividades ";

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
        <TituloActividad plantillaSeleccionada={`Trabajos del coordinador: ${dataRegister.actividad}`} />

        <TituloInforme plantillaSeleccionada="1. Trabajos inspeccionados" />

        {/* Observaciones de actividades */}
        <ObservacionesActividades dataRegister={dataRegister} />




        {/* <SeccionesDatosRegistros
          nombreCampo={"Localización"}
          valorDelCampo={dataRegister.observacionesLocalizacion}
        /> */}
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
          const totalEmpresas = dataRegister.mediosDisponibles.length;
          let width = "100%"; // default 1 columna
          if (totalEmpresas > 1) width = "33.33%"; // 3 columnas

          const isMiddleColumn = (index + 1) % 3 === 2; // Es la columna del medio

          return (
            <View
              key={index}
              style={{
                width,
                paddingRight: 4,
                ...(isMiddleColumn ? {
                  borderLeftWidth: 1,
                  borderLeftColor: "#e5e7eb",
                  borderRightWidth: 1,
                  borderRightColor: "#e5e7eb",
                } : {}),
                paddingLeft: 4,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  borderBottomWidth: index < totalEmpresas - 1 ? 1 : 0,
                  borderBottomColor: "#e5e7eb",
                  paddingBottom: 4,
                  marginBottom: index < totalEmpresas - 1 ? 8 : 0,
                }}
              >
                <SeccionesDatosRegistros
                  nombreCampo={`Empresa:`}
                  valorDelCampo={empresa.nombreEmpresa || "No especificado"}
                />
                <SeccionesDatosRegistros
                  nombreCampo={`Trabajadores:`}
                  valorDelCampo={empresa.numeroTrabajadores || "No especificado"}
                />
                <SeccionesDatosRegistros
                  nombreCampo={`Maquinaria:`}
                  valorDelCampo={empresa.maquinaria || ""}
                />
              </View>
            </View>
          );
        })}
      </View>





      {/* Sección 3 */}
      <View style={styles.section}>
        <TituloInforme plantillaSeleccionada="3. Observaciones en materia de seguridad y salud" />
        <SeccionesDatosRegistros
      
          valorDelCampo={dataRegister.observaciones}
        />
      </View>


    </View>
  );
};

export default DatosRegistro;
