import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";

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
  fieldRow: {
    flexDirection: "row",  
    flexWrap: "wrap",     
    marginBottom: 2,       
  },
  field: {
    width: "33.33%", 
  },
  singleField: {
    width: "100%",  
  },
});

const PrevisionActividades = ({ dataRegister }) => {
  const actividadesRaw = dataRegister.previsionesActividades || {};

  // Filtrar solo los campos con texto no vacío
  const actividades = Object.entries(actividadesRaw).filter(
    ([_, valor]) => typeof valor === "string" && valor.trim() !== ""
  );

  const isSingleActivity = actividades.length === 1;

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.section}>
        <View style={styles.fieldRow}>
          {actividades.length > 0 ? (
            actividades.map(([actividadKey, observacion], index) => {
              const formattedKey = `Actividad: `;
              return (
                <View
                  key={index}
                  style={isSingleActivity ? styles.singleField : styles.field}
                >
                  <SeccionesDatosRegistros
                    nombreCampo={formattedKey}
                    valorDelCampo={observacion}
                  />
                </View>
              );
            })
          ) : (
            <View style={styles.singleField}>
              <SeccionesDatosRegistros
                valorDelCampo="Sin previsión de actividades registrada."
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};


export default PrevisionActividades;
