import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase_config";

const TablaRegistros = () => {
  const [plantillas, setPlantillas] = useState([]);
  const [registrosPorPlantilla, setRegistrosPorPlantilla] = useState({});
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState("");
  const [camposFiltrados, setCamposFiltrados] = useState([]);
  const [valoresFiltro, setValoresFiltro] = useState({});

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

  useEffect(() => {
    const cargarCamposFiltrados = async () => {
      if (!plantillaSeleccionada) return;

      try {
        const plantilla = plantillas.find((p) => p.nombre === plantillaSeleccionada);
        const opcionesSnapshot = await getDocs(collection(db, "opcionesFormulario"));
        const opcionesCargadas = opcionesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const camposCoincidentes = plantilla?.campos
          .map((campo) => {
            const campoOpciones = opcionesCargadas
              .flatMap((doc) => doc.campos)
              .find((op) => op.nombre === campo.nombre);
            return {
              nombre: campo.nombre,
              valores: campoOpciones?.valores || [],
            };
          })
          .filter((campo) => campo.valores.length > 0);

        setCamposFiltrados(camposCoincidentes);
        setValoresFiltro({});
      } catch (error) {
        console.error("Error al cargar campos filtrados:", error);
      }
    };

    cargarCamposFiltrados();
  }, [plantillaSeleccionada, plantillas]);

  const cargarRegistros = async (plantilla) => {
    // Si ya están en registrosPorPlantilla, no hace falta volver a cargarlos
    if (registrosPorPlantilla[plantilla]) {
      console.log(`Usando registros guardados localmente para la plantilla: ${plantilla}`);
      setRegistrosFiltrados(registrosPorPlantilla[plantilla]);
      return;
    }
  
    console.log(`Realizando consulta a Firestore para la plantilla: ${plantilla}`);
  
    setLoading(true);
  
    try {
      const nombreColeccion = `${toCamelCase(plantilla)}Form`;
      const refColeccion = collection(db, nombreColeccion);
  
      const snapshot = await getDocs(refColeccion);
      const documentos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      setRegistrosPorPlantilla((prev) => ({
        ...prev,
        [plantilla]: documentos,
      }));
      setRegistrosFiltrados(documentos);
    } catch (error) {
      console.error("Error al cargar registros:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    let registrosFiltrados = registrosPorPlantilla[plantillaSeleccionada] || [];

    Object.keys(valoresFiltro).forEach((campo) => {
      if (valoresFiltro[campo]) {
        const campoNormalizado = campo.toLowerCase().trim();
        registrosFiltrados = registrosFiltrados.filter(
          (registro) =>
            registro[campoNormalizado]?.toString().toLowerCase().trim() ===
            valoresFiltro[campo].toString().toLowerCase().trim()
        );
      }
    });

    setRegistrosFiltrados(registrosFiltrados);
  }, [valoresFiltro, registrosPorPlantilla, plantillaSeleccionada]);

  const toCamelCase = (str) => {
    return str
      .toLowerCase()
      .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
        index === 0 ? match.toLowerCase() : match.toUpperCase()
      )
      .replace(/\s+/g, "");
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const obtenerColumnas = () => {
    const columnasExcluidas = ["tipoFormulario", "imagenes", "id"];
    const columnas = new Set();

    registrosFiltrados.forEach((registro) => {
      Object.keys(registro).forEach((campo) => {
        if (
          registro[campo] &&
          registro[campo] !== "" &&
          !columnasExcluidas.includes(campo)
        ) {
          columnas.add(campo);
        }
      });
    });

    return [...columnas].sort((a, b) => a.localeCompare(b));
  };

  const handleFiltroCambio = (campo, valor) => {
    setValoresFiltro((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Registros de Formularios</h1>

      {/* Selección de Plantilla */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {plantillas.map((plantilla) => (
          <button
            key={plantilla.id}
            onClick={() => {
              setPlantillaSeleccionada(plantilla.nombre);
              cargarRegistros(plantilla.nombre);
            }}
            className={`px-6 py-2 rounded-md font-semibold shadow-md ${
              plantillaSeleccionada === plantilla.nombre
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            } hover:bg-blue-500 transition`}
          >
            {plantilla.nombre}
          </button>
        ))}
      </div>

      {/* Filtros dinámicos */}
      {camposFiltrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {camposFiltrados.map((campo, index) => (
            <div key={index} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 mb-2">
                {capitalizeFirstLetter(campo.nombre)}
              </label>
              <select
                value={valoresFiltro[campo.nombre] || ""}
                onChange={(e) => handleFiltroCambio(campo.nombre, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              >
                <option value="">Todos</option>
                {[...campo.valores]
                  .sort((a, b) => a.valor.localeCompare(b.valor))
                  .map((valor, i) => (
                    <option key={i} value={valor.valor}>
                      {capitalizeFirstLetter(valor.valor)}
                    </option>
                  ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Tabla de registros */}
      {plantillaSeleccionada && (
        <>
          {loading ? (
            <p className="text-center text-gray-500 mt-8">Cargando registros...</p>
          ) : registrosFiltrados.length > 0 ? (
            <div className="overflow-x-auto bg-gray-50 p-6 rounded-md shadow-lg">
              <table className="table-auto w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {obtenerColumnas().map((columna, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 text-left text-sm text-gray-700"
                      >
                        {capitalizeFirstLetter(columna)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-blue-50 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-100"
                      }`}
                    >
                      {obtenerColumnas().map((columna, colIndex) => (
                        <td key={colIndex} className="border px-4 py-2 text-gray-800">
                          {registro[columna] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-8">
              No se encontraron registros para la plantilla seleccionada.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TablaRegistros;
