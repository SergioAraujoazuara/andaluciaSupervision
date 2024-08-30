import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_config'; 

const CompanyPerformanceChart = ({ filteredLotes }) => {
    const [datosSubactividades, setDatosSubactividades] = useState([]);
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');

    // Función para obtener los campos 'fecha', 'resultadoInspeccion', y 'sector' de todas las subactividades de todas las inspecciones
    const obtenerDatosSubactividades = async (arrayLotes) => {
        try {
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
        }
    };

    useEffect(() => {
        if (filteredLotes.length > 0) {
            obtenerDatosSubactividades(filteredLotes);
        }
    }, [filteredLotes]);

    // Función para agrupar y contar los resultados "Apto" y "No apto" por fecha y sector
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

        // Log para verificar los datos de "Apto", "No apto" y la fecha
        Object.keys(datosPorSector).forEach(sector => {
            console.log(`Sector: ${sector}`);
            datosPorSector[sector].forEach(row => {
                console.log(`Fecha: ${row[0]}, Apto: ${row[1]}, No apto: ${row[2]}`);
            });
        });

        return datosPorSector;
    };

    // Obtener los datos procesados para el gráfico
    const datosProcesados = procesarDatos();

    // Combinar los datos de todos los sectores
    const combinarDatos = () => {
        const sectores = Object.keys(datosProcesados);
        if (sectores.length === 0) return [['Fecha', 'Sector 1 Apto', 'Sector 1 No apto', 'Sector 2 Apto', 'Sector 2 No apto', 'Sector 3 Apto', 'Sector 3 No apto', 'Sector 4 Apto', 'Sector 4 No apto']];

        const fechas = [...new Set(datosSubactividades.map(item => item.fecha))]; // Obtener todas las fechas únicas
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

    // Calcular el valor máximo para el eje Y con un margen adicional
    const calcularMaxValue = (datos) => {
        let maxValue = 0;
        datos.forEach((row, index) => {
            if (index > 0) { // Saltar la primera fila (encabezados)
                const valores = row.slice(1); // Omitir la columna de fecha
                valores.forEach(valor => {
                    if (valor > maxValue) {
                        maxValue = valor;
                    }
                });
            }
        });
        return maxValue + 5; // Sumar 5 al valor máximo
    };

    // Seleccionar datos para mostrar según el sector
    const datosParaMostrar = sectorSeleccionado === 'Todos' ? combinarDatos() : datosProcesados[sectorSeleccionado] || [['Fecha', 'Apto', 'No apto']];
    
    // Calcular el maxValue dinámicamente
    const maxValue = calcularMaxValue(datosParaMostrar);

    // Configuración del gráfico
    const options = {
        title: `Resultados de ${sectorSeleccionado} a lo largo del tiempo`,
        hAxis: { title: 'Fecha', format: 'yyyy-MM-dd' },
        vAxis: { title: 'Cantidad', minValue: 0, maxValue: maxValue, format: '0' },
        legend: { position: 'top' },
        colors: sectorSeleccionado === 'Todos'
            ? ['#14b8a6', '#f87171', '#6b7280', '#10b981', '#6366f1', '#f97316', '#3b82f6', '#f43f5e']
            : ['#14b8a6', '#f87171'],
        series: {
            0: { color: '#14b8a6' },
            1: { color: '#f87171' }
        }
    };

    // Manejar cambios en el filtro de sector
    const handleSectorChange = (e) => {
        setSectorSeleccionado(e.target.value);
    };

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
            <div className='mb-4'>
                <select id='sector-select' className='rounded-lg p-1 bg-gray-100' value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value='Todos'>Todos</option>
                    {Object.keys(datosProcesados).map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>
            </div>

            {/* Gráfico de líneas para "Apto" y "No apto" en el mismo gráfico */}
            <Chart
                chartType="LineChart"
                width="100%"
                height="250px"
                data={datosParaMostrar}
                options={options}
            />
        </div>
    );
};

export default CompanyPerformanceChart;
