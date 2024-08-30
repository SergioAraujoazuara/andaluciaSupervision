import React, { useState } from 'react';
import { Chart } from "react-google-charts";

const GraficaNoAptosPorSector = ({ datosNoAptosPorSector }) => {
    // Estado para manejar el sector seleccionado
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');

    // Lista de colores pastel (uno por cada sector)
    const colors = ['#F4A8A8', '#EFB7B7', '#F8C6C6', '#F9D5D5', '#F3A1A1', '#F7B3B3', '#FAC0C0', '#F5E0E0'];

    // Filtrar datos según el sector seleccionado
    const datosFiltrados = sectorSeleccionado === 'Todos'
        ? datosNoAptosPorSector.slice(1) // Mostrar todos los sectores
        : datosNoAptosPorSector.slice(1).filter(item => item[0] === sectorSeleccionado); // Filtrar por sector seleccionado

    // Transformar los datos para la gráfica
    const data = [
        ['Sector', 'No Aptos', { role: 'style' }],
        ...datosFiltrados.map((item, index) => [item[0], item[1], `color: ${colors[index % colors.length]}`]),
    ];

    // Manejar cambios en el filtro de sector
    const handleSectorChange = (e) => {
        setSectorSeleccionado(e.target.value);
    };

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg flex flex-col items-start'>
            {/* Filtro de sector */}
            <div className='mb-4'>
               
                <select className='rounded-lg p-1 bg-gray-100' id='sector-select' value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value='Todos'>Todos</option>
                    {datosNoAptosPorSector.slice(1).map((item, index) => (
                        <option key={index} value={item[0]}>{item[0]}</option>
                    ))}
                </select>
            </div>

            {/* Gráfico de barras */}
            <Chart
                chartType="BarChart"
                data={data}
                options={{
                    title: 'Actividades No Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                        maxValue: Math.max(...datosFiltrados.map(item => item[1])) + 1,
                    },
                    vAxis: {
                        textPosition: 'out',
                    },
                    legend: { position: 'none' },
                    bar: { groupWidth: '75%' },
                    isStacked: false,
                    annotations: {
                        alwaysOutside: true,
                        textStyle: {
                            fontSize: 12,
                            auraColor: 'none',
                            color: '#555',
                        },
                    },
                }}
                width="100%"
                height="250px"
            />
        </div>
    );
};

export default GraficaNoAptosPorSector;
