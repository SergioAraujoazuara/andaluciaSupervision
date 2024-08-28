import React from 'react';
import { Chart } from "react-google-charts";

const GraficaNoAptosPorSector = ({ datosNoAptosPorSector }) => {
    // Lista de colores pastel (uno por cada sector)
    const colors = ['#F4A8A8', '#EFB7B7', '#F8C6C6', '#F9D5D5', '#F3A1A1', '#F7B3B3', '#FAC0C0', '#F5E0E0'];


    // Transformar los datos para que cada sector tenga su propio color
    const data = [
        ['Sector', 'No Aptos', { role: 'style' }],
        ...datosNoAptosPorSector.slice(1).map((item, index) => [item[0], item[1], `color: ${colors[index % colors.length]}`]),
    ];

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="BarChart"
                data={data}
                options={{
                    title: 'Actividades No Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                        maxValue: Math.max(...datosNoAptosPorSector.slice(1).map(item => item[1])) + 1,
                        title: null, // Remove the horizontal axis title
                    },
                    vAxis: {
                        title: null, // Remove the vertical axis title
                        textPosition: 'out', // Position the labels outside the bars
                    },
                    legend: { position: 'none' }, // Remove the legend
                    bar: { groupWidth: '75%' }, // Bar width
                    isStacked: false, // Do not stack bars
                    annotations: { // Show values outside the bars
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
