import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../../firebase_config";

const TablaRegistros = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const registrosPorPagina = 1;

  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        const plantillasSnapshot = await getDocs(collection(db, "plantillas"));
        const plantillasCargadas = plantillasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlantillas(plantillasCargadas);
      } catch (error) {
        console.error("Error al cargar plantillas:", error);
      }
    };

    cargarPlantillas();
  }, []);

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, ""); // Eliminar espacios
  };

  const handleCargarRegistros = async (reset = false) => {
    if (!plantillaSeleccionada) {
      alert("Por favor, selecciona un tipo de formulario.");
      return;
    }

    setLoading(true);
    try {
      const documentos = [];
      const nombreColeccion = `${toCamelCase(plantillaSeleccionada)}Form`;
      const refColeccion = collection(db, nombreColeccion);

      let consulta = query(refColeccion, orderBy("fechaHora"), limit(registrosPorPagina));

      if (!reset && lastDoc) {
        consulta = query(refColeccion, orderBy("fechaHora"), startAfter(lastDoc), limit(registrosPorPagina));
      }

      const snapshot = await getDocs(consulta);

      if (reset) {
        setRegistros([]); // Reiniciar los registros si se está recargando
      }

      snapshot.forEach((doc) => {
        documentos.push({ id: doc.id, ...doc.data(), tipoFormulario: plantillaSeleccionada });
      });

      setRegistros((prev) => [...prev, ...documentos]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      // Si hay menos documentos de los esperados, significa que no hay más
      setHasMore(snapshot.docs.length === registrosPorPagina);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  const obtenerColumnas = () => {
    const columnas = new Set(["tipoFormulario"]); // Siempre incluir tipoFormulario como columna fija
    registros.forEach((registro) => {
      Object.keys(registro).forEach((campo) => columnas.add(campo));
    });
    return [...columnas];
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 shadow-md rounded-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Registros de Formularios</h1>

      {/* Filtro de Plantillas */}
      <div className="bg-white p-6 rounded-md shadow-md mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Filtrar por Plantilla</h3>
        <select
          value={plantillaSeleccionada}
          onChange={(e) => setPlantillaSeleccionada(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="">-- Seleccionar Plantilla --</option>
          {plantillas.map((plantilla) => (
            <option key={plantilla.id} value={plantilla.nombre}>
              {plantilla.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleCargarRegistros(true)}
          className="mt-4 px-6 py-2 bg-sky-600 text-white font-semibold rounded-md shadow hover:bg-sky-700 transition w-full"
        >
          Cargar Registros
        </button>
      </div>

      {/* Tabla de resultados */}
      {loading ? (
        <p className="text-center text-gray-700">Cargando registros...</p>
      ) : registros.length > 0 ? (
        <div className="overflow-x-auto bg-white p-6 rounded-md shadow-md">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {obtenerColumnas().map((columna, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-4 py-2 text-left text-sm text-gray-700"
                  >
                    {columna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {registros.map((registro, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {obtenerColumnas().map((columna, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-gray-300 px-4 py-2 text-sm text-gray-800"
                    >
                      {registro[columna] || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botón de paginación */}
          {hasMore && (
            <button
              onClick={() => handleCargarRegistros(false)}
              className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-md shadow hover:bg-green-700 transition"
            >
              Cargar Más
            </button>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-700">
          No se encontraron registros para la plantilla seleccionada.
        </p>
      )}
    </div>
  );
};

export default TablaRegistros;
