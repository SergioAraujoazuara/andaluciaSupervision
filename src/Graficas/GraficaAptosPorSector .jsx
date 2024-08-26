import React from 'react';
import { Chart } from "react-google-charts";

const GraficaAptosPorSector = ({ datosAptosPorSector }) => {
    // Transformar datos para que cada sector tenga su propia columna con un valor correspondiente
    const data = [
        ['Sector', ...datosAptosPorSector.slice(1).map(item => item[0])],  // Primera fila con los nombres de los sectores
        ['Aptos', ...datosAptosPorSector.slice(1).map(item => item[1])]    // Segunda fila con los valores aptos para cada sector
    ];

    // Lista de colores (uno por cada sector)
    const colors = ['#AEC6CF', '#FFB3BA', '#FFDFBA', '#FFFFBA', '#B3E5FC', '#C2F0C2', '#FFCCCB', '#B2B2FF'];


    return (
        <div className='bg-white p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="BarChart"
                data={data}
                options={{
                    title: 'Actividades Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                    },
                    vAxis: {
                        title: 'Número de Actividades Aptas',
                    },
                    colors: colors.slice(0, datosAptosPorSector.length - 1), // Aplica colores solo a las barras existentes
                    legend: { position: 'bottom' }, // Muestra la leyenda en la parte inferior
                    bar: { groupWidth: '75%' }, // Ancho de las barras
                    isStacked: false, // No apilar las barras
                }}
                width="100%"
                height="250px"
            />
        </div>
    );
};

export default GraficaAptosPorSector;
