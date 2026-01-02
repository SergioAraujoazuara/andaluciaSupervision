import React from "react";
import { View, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";
import TituloActividad from "./TituloActividad";
import ObservacionesActividades from "./ObservacionesActividades ";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    width: "100%",
    marginBottom: 2,
  },
  section: {
    width: "100%",
  },
  sectionWithTopMargin: {
    width: "100%",
    marginTop: 8,
  },
});

const DatosRegistro = ({ dataRegister }) => {
  return (
    <View style={styles.fieldGroup}>
      {/* Sección 1 */}
      <View style={styles.section}>
        <TituloActividad plantillaSeleccionada={`Trazabilidad de inspección:`} />
        {/* Trazabilidad visual */}
        <View>
          <TituloInforme plantillaSeleccionada={[
            dataRegister.sectorNombre,
            dataRegister.subSectorNombre,
            dataRegister.parteNombre,
            dataRegister.elementoNombre,
            dataRegister.nombre
          ].filter(
            v => v && !['na', 'n-a', 'n/a'].includes(v.trim().toLowerCase())
          ).join(' - ')} />
        </View>
      </View>

      
      {/* Sección 3 */}
      <View style={styles.sectionWithTopMargin}>
        <TituloInforme plantillaSeleccionada="1. Observaciones generales" />
        <SeccionesDatosRegistros
          valorDelCampo={dataRegister.observaciones}
        />
      </View>


    </View>
  );
};

export default DatosRegistro;
