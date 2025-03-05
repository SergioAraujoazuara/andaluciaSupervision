import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  fieldGroup: {
    flexDirection: "row",
    flexWrap: "wrap", // Permitir que los elementos se ajusten en filas nuevas
    justifyContent: "space-between", // Distribuir columnas uniformemente
    marginBottom: 6,
    marginLeft: 8,
  },
  fieldColumn: {
    width: "30%", // Cada columna ocupa aproximadamente un tercio del ancho
    marginBottom: 5,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: "#4b5563",
    fontSize: 9,
    marginBottom: 2,
  },
  fieldValue: {
    color: "#4b5563",
    fontSize: 9,
    lineHeight: 1.5,
    wordBreak: "break-word",
    marginBottom: 2,
  },
});

/**
 * Convierte una fecha ISO a formato visual dd/mm/yyyy.
 * @param {string} fechaISO
 * @returns {string}
 */
const convertirFechaISOaVisual = (fechaISO) => {
  if (!fechaISO) return "N/A"; // Manejar caso de valores vacíos
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const segundos = String(fecha.getSeconds()).padStart(2, "0");

  return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
};

/**
 * Mapea las claves del registro a etiquetas descriptivas.
 */
const columnasMap = {
  fechaHora: "Fecha y hora",
  sectorNombre: "Grupo activos",
  subSectorNombre: "Activo",
  parteNombre: "Inventario vial",
  elementoNombre: "Componente",
  actividad: "Actividad",
  observaciones: "Observaciones",
};

// Orden específico de las columnas
const ordenColumnas = [
  "fechaHora",
  "sectorNombre",
  "subSectorNombre",
  "parteNombre",
  "elementoNombre",
  "actividad",
  "observaciones",
];

/**
 * DatosRegistro Component
 *
 * Muestra los datos de un registro filtrando ciertas claves específicas y
 * formatea las etiquetas de los campos.
 *
 * @param {Object} registro - Objeto que contiene los datos del registro.
 * @param {Array<string>} [excluirClaves=[]] - Claves a excluir de la visualización.
 */
const DatosRegistro = ({ registro, excluirClaves = [] }) => {
  return (
    <View style={styles.fieldGroup}>
      {ordenColumnas
        .filter((key) => registro[key] !== undefined && !excluirClaves.includes(key)) // Filtrar las claves que existan en el registro y no estén excluidas
        .map((key, i) => {
          // Usar el label definido en columnasMap o la clave original como fallback
          const label = columnasMap[key] || key;

          // Si la clave es fechaHora, convertir el formato
          const formattedValue =
            key === "fechaHora" && registro[key]
              ? convertirFechaISOaVisual(registro[key])
              : Array.isArray(registro[key])
              ? registro[key].join(", ")
              : registro[key] || "N/A";

          return (
            <View key={i} style={styles.fieldColumn}>
              <Text style={styles.fieldLabel}>{label}:</Text>
              <Text style={styles.fieldValue}>{formattedValue}</Text>
            </View>
          );
        })}
    </View>
  );
};

export default DatosRegistro;
