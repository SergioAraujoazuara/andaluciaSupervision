import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "column",
    marginBottom: 6,
    marginLeft: 8,
  },
  actividadBlock: {
    borderRadius: 6,
    marginBottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "#fff",
    position: "relative",
  },
  actividadHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  actividadTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#5F6B75",
    flex: 3,
  },
  actividadEstado: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#388e3c",
    flex: 1,
    textAlign: "right",
  },
  observacionText: {
    fontSize: 8,
    color: "#5F6B75",
    marginBottom: 4,
    lineHeight: 1.2,
  },
  subActividadBlock: {
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#fff",
  },
  subActividadTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  subActividadText: {
    fontSize: 8,
    color: "#5F6B75",
    marginBottom: 2,
    lineHeight: 1.2,
  },
  subActividadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  subActividadStatus: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#388e3c",
  },
  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 2,
  },
  value: {
    fontSize: 8,
    color: "#5F6B75",
    marginBottom: 4,
    lineHeight: 1.2,
  },
});

const DatosRegistroTabla = ({ registro }) => {
  return (
    <View style={styles.fieldGroup}>
      <TituloInforme plantillaSeleccionada="3. ANEXO: Detalles de la inspección (PPI)" />

      {registro.actividades &&
        Object.values(registro.actividades)
          .filter((actividad) => actividad.seleccionada === true)
          .map((actividad, index) => (
            <View key={index} style={styles.actividadBlock}>
              <View style={styles.actividadHeader}>
                <Text style={styles.actividadTitle}>
                  Actividad: {actividad.nombre || `Actividad ${index + 1}`}
                </Text>
                <Text style={styles.actividadEstado}>Aplica ✅</Text>
              </View>

              <Text style={styles.observacionText}>
                {actividad.observacion || "—"}
              </Text>

              {actividad.subactividades &&
                actividad.subactividades.filter((sub) => sub.seleccionada === true).length > 0 && (
                  <View style={styles.subActividadBlock}>
                    <Text style={styles.label}>Subactividades:</Text>
                    {actividad.subactividades
                      .filter((sub) => sub.seleccionada === true)
                      .map((subactividad, subIndex) => (
                        <View key={subIndex} style={{ marginBottom: 4 }}>
                          <View style={styles.subActividadRow}>
                            <Text style={styles.subActividadTitle}>
                              Nombre: {subactividad.nombre || `Subactividad ${subIndex + 1}`}
                            </Text>
                            <Text style={styles.subActividadStatus}>Aplica ✅</Text>
                          </View>
                          <Text style={styles.subActividadText}>
                            Observación: {subactividad.observacion || "—"}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
            </View>
          ))}
    </View>
  );
};

export default DatosRegistroTabla;
