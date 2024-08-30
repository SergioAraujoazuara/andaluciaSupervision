import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Importación correcta de Firestore
import { db } from '../../firebase_config'; // Asegúrate de que la ruta a tu configuración de Fir
import { Chart } from 'react-google-charts';

const CompanyPerformanceChart = ({ filteredLotes, getInspections }) => { // Usar filteredLotes como prop
    const [datosSubactividades, setDatosSubactividades] = useState([]);
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');

    // useEffect para cargar los lotes desde Firestore cuando se monta el componente
    useEffect(() => {
        fetchInspections();
    }, [filteredLotes]); // Añadir filteredLotes como dependencia

    // Función para obtener los lotes desde Firestore
    const fetchInspections = async () => {
        try {
            if (Array.isArray(filteredLotes) && filteredLotes.length > 0) {  // Verificar que `filteredLotes` sea un array válido
                const lotesData = await getInspections(filteredLotes); // Usar la función importada con `filteredLotes`
                setDatosSubactividades(lotesData); // Guardar los lotes en el estado
            } else {
                console.error('Error: filteredLotes no es un array válido o está vacío.');
            }
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    };

    // Función para agrupar y contar los resultados "Apto" y "No Apto" por fecha y sector
    const procesarDatos = () => {
        const datosPorSector = {};

        datosSubactividades.forEach(({ fecha, resultadoInspeccion, sector }) => {
            if (!datosPorSector[sector]) {
                datosPorSector[sector] = [['Fecha', 'Apto', 'No Apto']];
            }

            const fechaEncontrada = datosPorSector[sector].find(row => row[0] === fecha);

            if (fechaEncontrada) {
                if (resultadoInspeccion === 'Apto') {
                    fechaEncontrada[1] += 1;
                } else {
                    fechaEncontrada[2] += 1;
                }
            } else {
                datosPorSector[sector].push([fecha, resultadoInspeccion === 'Apto' ? 1 : 0, resultadoInspeccion === 'No Apto' ? 1 : 0]);
            }
        });

        return datosPorSector;
    };

    // Obtener los datos procesados para el gráfico
    const datosProcesados = procesarDatos();

    // Combinar los datos de todos los sectores
    const combinarDatos = () => {
        const sectores = Object.keys(datosProcesados);
        if (sectores.length === 0) return [['Fecha', 'Sector 1 Apto', 'Sector 1 No Apto', 'Sector 2 Apto', 'Sector 2 No Apto', 'Sector 3 Apto', 'Sector 3 No Apto', 'Sector 4 Apto', 'Sector 4 No Apto']];

        const fechas = [...new Set(datosSubactividades.map(item => item.fecha))]; // Obtener todas las fechas únicas
        const datosCombinados = [['Fecha', ...sectores.flatMap(sector => [`${sector} Apto`, `${sector} No Apto`])]];

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
    const datosParaMostrar = sectorSeleccionado === 'Todos' ? combinarDatos() : datosProcesados[sectorSeleccionado] || [['Fecha', 'Apto', 'No Apto']];
    
    // Calcular el maxValue dinámicamente
    const maxValue = calcularMaxValue(datosParaMostrar);

    // Configuración del gráfico
    const options = {
        title: `Resultados de ${sectorSeleccionado} a lo largo del tiempo`,
        hAxis: { title: 'Fecha', format: 'yyyy-MM-dd' },
        vAxis: { title: 'Cantidad', minValue: 0, maxValue: maxValue, format: '0' }, // Configurar maxValue
        legend: { position: 'top' },
        colors: sectorSeleccionado === 'Todos'
            ? ['#14b8a6', '#f87171', '#6b7280', '#10b981', '#6366f1', '#f97316', '#3b82f6', '#f43f5e']
            : ['#14b8a6', '#f87171'], // Diferentes colores para "Todos" y sectores individuales
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

            {/* Gráfico de líneas para "Apto" y "No Apto" en el mismo gráfico */}
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
