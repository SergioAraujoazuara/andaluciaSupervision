import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import TituloInforme from "./TituloInforme";
import SeccionesDatosRegistros from "./SeccionesDatosRegistros";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 6,
    marginLeft: 2,
  },
  fieldColumn: {
    width: "100%",
    marginBottom: 5,
  },
  fieldLabelContainer: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4

  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 2,
  },
  fieldValue: {
    color: "#374151",
    fontSize: 9,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginBottom: 2,
    marginTop: 6,
    paddingHorizontal: 8,
  },
  tableContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    width: "100%", // Asegura que la tabla use todo el ancho disponible
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    padding: 5,
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
    paddingVertical: 4,
    width: "100%",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    flex: 1,
    textAlign: "start",
    color: "#374151",
    paddingHorizontal: 4, // Agrega un poco de espacio a los lados
  },
  tableCell: {
    fontSize: 9,
    flex: 1,
    textAlign: "start",
    color: "#4B5563",
    paddingHorizontal: 4,
    minWidth: "25%", // Evita que las columnas colapsen
    maxWidth: "33%", // Controla el ancho máximo
    wordWrap: "break-word", // Asegura que el texto no se desborde
  },
  subActividadRow: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 3,
    width: "100%",
  },
  subActividadCell: {
    fontSize: 8,
    flex: 1,
    textAlign: "center",
    color: "#4B5563",
    paddingHorizontal: 4,
    minWidth: "25%",
    maxWidth: "33%",
    wordWrap: "break-word",
  },
  aptoText: {
    fontSize: 12, // 🔹 Se agranda el texto (ajusta el tamaño según tu preferencia)
    fontWeight: "bold", // 🔹 Negrita para resaltar más
    textTransform: "uppercase", // 🔹 Asegura que siempre esté en mayúsculas
  },
  resultadoVisita: {
    marginTop: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
    textAlign: "center",
  },

  resultadoTexto: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "#374151",
  },
});

const convertirFechaISOaVisual = (fechaISO) => {
  if (!fechaISO) return "N/A";
  const fecha = new Date(fechaISO);
  return `${fecha.getDate().toString().padStart(2, "0")}/${(fecha.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${fecha.getFullYear()} ${fecha.getHours()
      .toString()
      .padStart(2, "0")}:${fecha.getMinutes()
        .toString()
        .padStart(2, "0")}:${fecha.getSeconds().toString().padStart(2, "0")}`;
};

const columnasMap = {
  apto: "Resultado visita",
  fechaHora: "Fecha y hora",
  sectorNombre: "Grupo activos",
  subSectorNombre: "Activo",
  parteNombre: "Inventario vial",
  elementoNombre: "Componente",
  actividad: "Actividad",
  observaciones: "Observaciones en materia de seguridad  salud",
  actividadesProximoInicio: "Actividades Próximo Inicio",
  controlAccesos: "Control de Accesos",
  controlSiniestraidad: "Control de Siniestralidad",
  controlSubcontratacion: "Control de Subcontratación",
  medidasPreventivas: "Medidas Preventivas",
  observacionesActividad: "Observaciones Actividad",
  observacionesLocalizacion: "Ubicación",
  registroEmpresas: "Registro de Empresas",
};

const ordenColumnas = [
  "fechaHora",
  "sectorNombre",
  "subSectorNombre",
  "parteNombre",
  "elementoNombre",
  "actividad",
  "actividadesProximoInicio",
  "controlAccesos",
  "controlSiniestraidad",
  "controlSubcontratacion",
  "medidasPreventivas",
  "observacionesActividad",
  "observacionesLocalizacion",
  "registroEmpresas",
  "observaciones",
];


const DatosRegistro = ({ registro, excluirClaves = [], dataRegister }) => {
  return (
    <View style={styles.fieldGroup}>

      {/* Seccion 1 */}

      <TituloInforme plantillaSeleccionada="1. Trabajos inspeccionados" />
      <SeccionesDatosRegistros nombreCampo={'Observaciones actividad'} valorDelCampo={dataRegister.observacionesActividad} />
      <SeccionesDatosRegistros nombreCampo={'Observaciones localización'} valorDelCampo={dataRegister.observacionesLocalizacion} />

      {/* Seccion 2 */}
      <TituloInforme plantillaSeleccionada="2. Medios disponibles en obra: Empresas, trabajadores y maquinaria" />
      <SeccionesDatosRegistros nombreCampo={'Maquinaria'} valorDelCampo={dataRegister.mediosDisponibles.maquinaria} />
      <SeccionesDatosRegistros nombreCampo={'Nombre de la empresa'} valorDelCampo={dataRegister.mediosDisponibles.nombreEmpresa} />
      <SeccionesDatosRegistros nombreCampo={'Número de trabajadores'} valorDelCampo={dataRegister.mediosDisponibles.numeroTrabajadores} />

      {/* Seccion 3 */}
      <TituloInforme  plantillaSeleccionada="3. Observaciones en materia de seguridad y salud" />
      <SeccionesDatosRegistros nombreCampo={'Observaciones'} valorDelCampo={dataRegister.observaciones} />

      {/* Seccion 4 */}
      <TituloInforme plantillaSeleccionada="4. Previsión de actividades de próximo inicio. Medias preventivas y pasos." />
      <SeccionesDatosRegistros nombreCampo={'Actividades próximo inicio'} valorDelCampo={dataRegister.actividadesProximoInicio} />
      <SeccionesDatosRegistros nombreCampo={'Medidas preventivas'} valorDelCampo={dataRegister.medidasPreventivas} />

      
    </View>
  );
};

export default DatosRegistro;
