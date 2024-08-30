import React, { useState } from 'react';
import { Chart } from "react-google-charts";

const GraficaAptosPorSector = ({ datosAptosPorSector }) => {
    // Estado para el sector seleccionado
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');

    // Lista de colores empresariales (uno por cada sector)
    const colors = ['#A8D5BA', '#B8E2C8', '#C9EAD3', '#D4F1D4', '#E1F8E7', '#C7E2B5', '#B3D6A2', '#9CCFA2'];

    // Filtrar datos según el sector seleccionado
    const datosFiltrados = sectorSeleccionado === 'Todos'
        ? datosAptosPorSector.slice(1) // Mostrar todos los sectores
        : datosAptosPorSector.slice(1).filter(item => item[0] === sectorSeleccionado); // Filtrar por sector seleccionado

    // Transformar datos para la gráfica
    const data = [
        ['Sector', 'Aptos', { role: 'style' }],
        ...datosFiltrados.map((item, index) => [item[0], item[1], `color: ${colors[index]}`])
    ];

    // Manejar cambios en el filtro de sector
    const handleSectorChange = (e) => {
        setSectorSeleccionado(e.target.value);
    };

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg flex flex-col items-start'>
            {/* Filtro de sector */}
            <div className='mb-4'>
              
                <select id='sector-select' className='rounded-lg p-1 bg-gray-100' value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value='Todos'>Todos</option>
                    {datosAptosPorSector.slice(1).map((item, index) => (
                        <option key={index} value={item[0]}>{item[0]}</option>
                    ))}
                </select>
            </div>

            {/* Gráfico de barras */}
            <Chart
                chartType="BarChart"
                data={data}
                options={{
                    title: 'Actividades Aptas por Sector',
                    hAxis: {
                        minValue: 0,
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

export default GraficaAptosPorSector;
