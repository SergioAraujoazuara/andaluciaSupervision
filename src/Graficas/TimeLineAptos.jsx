import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_config';
import { RiLoader2Line } from "react-icons/ri";

const CompanyPerformanceChart = ({ filteredLotes }) => {
    const [datosSubactividades, setDatosSubactividades] = useState([]);
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');
    const [loading, setLoading] = useState(true);  // Estado de carga
    const [error, setError] = useState(null);  // Estado de error

    const obtenerDatosSubactividades = async (arrayLotes) => {
        try {
            setLoading(true); // Inicia la carga
            const promesasLotes = arrayLotes.map(async (lote) => {
                const inspeccionesRef = collection(db, `lotes/${lote.id}/inspecciones`);
                const inspeccionesSnapshot = await getDocs(inspeccionesRef);
                const sector = lote.sectorNombre;

                return inspeccionesSnapshot.docs.flatMap((doc) => {
                    const inspeccionData = doc.data();
                    if (inspeccionData.actividades && Array.isArray(inspeccionData.actividades)) {
                        return inspeccionData.actividades.flatMap((actividad) => {
                            if (actividad.subactividades && Array.isArray(actividad.subactividades)) {
                                return actividad.subactividades
                                    .filter((subactividad) => subactividad.fecha && subactividad.resultadoInspeccion)
                                    .map(({ fecha, resultadoInspeccion }) => ({ fecha, resultadoInspeccion, sector }));
                            }
                            return [];
                        });
                    }
                    return [];
                });
            });

            const resultados = (await Promise.all(promesasLotes)).flat();
            setDatosSubactividades(resultados);
        } catch (error) {
            console.error('Error al obtener los datos de subactividades:', error);
            setError('Error al cargar los datos. Intenta nuevamente.'); // Guarda el error
        } finally {
            setLoading(false); // Finaliza la carga
        }
    };

    useEffect(() => {
        if (filteredLotes.length > 0) {
            obtenerDatosSubactividades(filteredLotes);
        }
    }, [filteredLotes]);

    const procesarDatos = () => {
        const datosPorSector = {};
        const acumuladoPorSector = {};

        datosSubactividades.forEach(({ fecha, resultadoInspeccion, sector }) => {
            if (!fecha || !resultadoInspeccion || !sector) {
                console.error('Datos incompletos:', { fecha, resultadoInspeccion, sector });
                return;
            }

            if (!datosPorSector[sector]) {
                datosPorSector[sector] = [['Fecha', 'Apto', 'No apto']];
                acumuladoPorSector[sector] = { 'Apto': 0, 'No apto': 0 };
            }

            if (resultadoInspeccion === 'Apto' || resultadoInspeccion === 'No apto') {
                acumuladoPorSector[sector][resultadoInspeccion] += 1;
            }

            const fechaEncontrada = datosPorSector[sector].find(row => row[0] === fecha);

            if (fechaEncontrada) {
                fechaEncontrada[1] = acumuladoPorSector[sector]['Apto'];
                fechaEncontrada[2] = acumuladoPorSector[sector]['No apto'];
            } else {
                datosPorSector[sector].push([fecha, acumuladoPorSector[sector]['Apto'], acumuladoPorSector[sector]['No apto']]);
            }
        });

        return datosPorSector;
    };

    const datosProcesados = procesarDatos();

    const combinarDatos = () => {
        const sectores = Object.keys(datosProcesados);
        if (sectores.length === 0) return [['Fecha', 'Sector 1 Apto', 'Sector 1 No apto', 'Sector 2 Apto', 'Sector 2 No apto', 'Sector 3 Apto', 'Sector 3 No apto', 'Sector 4 Apto', 'Sector 4 No apto']];

        const fechas = [...new Set(datosSubactividades.map(item => item.fecha))];
        const datosCombinados = [['Fecha', ...sectores.flatMap(sector => [`${sector} Apto`, `${sector} No apto`])]];

        fechas.forEach((fecha) => {
            const fila = [fecha];
            sectores.forEach((sector) => {
                const datosFecha = datosProcesados[sector].find(row => row[0] === fecha) || [fecha, 0, 0];
                fila.push(datosFecha[1], datosFecha[2]);
            });
            datosCombinados.push(fila);
        });

        return datosCombinados;
    };

    const calcularMaxValue = (datos) => {
        let maxValue = 0;
        datos.forEach((row, index) => {
            if (index > 0) {
                const valores = row.slice(1);
                valores.forEach(valor => {
                    if (valor > maxValue) {
                        maxValue = valor;
                    }
                });
            }
        });
        return maxValue + 5;
    };

    const datosParaMostrar = sectorSeleccionado === 'Todos' ? combinarDatos() : datosProcesados[sectorSeleccionado] || [['Fecha', 'Apto', 'No apto']];

    const maxValue = calcularMaxValue(datosParaMostrar);

    // Generar dinámicamente las opciones de series
    const generarSeries = (datos) => {
        const seriesOptions = {};
        datos[0].slice(1).forEach((_, index) => { // Empezar desde 1 para saltar la columna de 'Fecha'
            if (index % 2 === 0) { // Indices pares para "Apto"
                seriesOptions[index] = { color: '#14b8a6' }; // Verde para "Apto"
            } else { // Indices impares para "No apto"
                seriesOptions[index] = { color: '#f87171' }; // Rojo para "No apto"
            }
        });
        return seriesOptions;
    };

    // Usar la función para generar las opciones de las series
    const options = {
        hAxis: { title: 'Fecha', format: 'yyyy-MM-dd' },
        vAxis: { title: 'Cantidad', minValue: 0, maxValue: maxValue, format: '0' },
        legend: { position: 'none' }, // Elimina la leyenda
        colors: ['#6ee7b7', '#fca5a5'], // Colores principales
        series: generarSeries(datosParaMostrar), // Configurar series dinámicamente
        backgroundColor: '#f3f4f6', // Fondo del gráfico completo
        chartArea: {
            left: 50,   // Espacio a la izquierda
            right: 30,  // Espacio a la derecha
            top: 20,    // Espacio en la parte superior
            bottom: 60, // Espacio en la parte inferior
            width: '80%',  // Ancho del área del gráfico
            height: '70%'  // Altura del área del gráfico
        }
    };

    const handleSectorChange = (e) => {
        setSectorSeleccionado(e.target.value);
    };

    return (
        <div className='bg-gray-100 p-4 rounded-lg shadow-lg'>
            <div className='flex justify-between items-center w-full mb-1'>
                <p className='font-medium'>Timeline apto/no apto</p>
                <select id='sector-select' className='rounded-lg p-1 bg-gray-200' value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value='Todos'>Todos</option>
                    {Object.keys(datosProcesados).map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>
            </div>

            {/* Mostrar mensaje de carga, error o gráfico */}
            {loading ? (
                <div className='w-full h-full flex items-start pt-20 justify-center'>
                    <RiLoader2Line className='text-4xl' />
                </div>

            ) : error ? (
                <p>{error}</p>
            ) : (
                <Chart
                    chartType="LineChart"
                    width="100%"
                    height="250px"
                    data={datosParaMostrar}
                    options={options}
                />
            )}
        </div>
    );
};

export default CompanyPerformanceChart;
