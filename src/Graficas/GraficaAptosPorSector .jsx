import React from 'react';
import { Chart } from "react-google-charts";

const GraficaAptosPorSector = ({ datosAptosPorSector }) => {
    // Lista de colores empresariales (uno por cada sector)
    const colors = ['#A8D5BA', '#B8E2C8', '#C9EAD3', '#D4F1D4', '#E1F8E7', '#C7E2B5', '#B3D6A2', '#9CCFA2'];



    // Transformar datos para que cada sector tenga su propia columna con un valor correspondiente
    const data = [
        ['Sector', 'Aptos', { role: 'style' }],  // Primera fila con los nombres de los sectores, los valores de "Aptos", y el estilo
        ...datosAptosPorSector.slice(1).map((item, index) => [item[0], item[1], `color: ${colors[index]}`]) // Filas con los sectores, los valores de "Aptos" y el color de la barra
    ];

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
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
