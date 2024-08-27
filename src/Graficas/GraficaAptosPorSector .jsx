import React from 'react';
import { Chart } from "react-google-charts";

const GraficaAptosPorSector = ({ datosAptosPorSector }) => {
    // Lista de colores empresariales (uno por cada sector)
    const colors = ['#2F4F4F', '#4682B4', '#708090', '#B0C4DE', '#556B2F', '#6B8E23', '#A9A9A9', '#778899'];

    // Transformar datos para que cada sector tenga su propia columna con un valor correspondiente
    const data = [
        ['Sector', 'Aptos', { role: 'style' }],  // Primera fila con los nombres de los sectores, los valores de "Aptos", y el estilo
        ...datosAptosPorSector.slice(1).map((item, index) => [item[0], item[1], `color: ${colors[index]}`]) // Filas con los sectores, los valores de "Aptos" y el color de la barra
    ];

    return (
        <div className='bg-white p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="BarChart"
                data={data}
                options={{
                    title: 'Actividades Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                        title: null, // Remove the horizontal axis title
                    },
                    vAxis: {
                        title: null, // Remove the vertical axis title
                        textPosition: 'out', // Coloca los nombres de los sectores fuera de las barras
                    },
                    legend: { position: 'none' }, // Quita la leyenda
                    bar: { groupWidth: '75%' }, // Ancho de las barras
                    isStacked: false, // No apilar las barras
                    annotations: { // Muestra los valores fuera de las barras
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
