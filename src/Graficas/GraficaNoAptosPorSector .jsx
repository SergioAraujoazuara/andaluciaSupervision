import React from 'react';
import { Chart } from "react-google-charts";

const GraficaNoAptosPorSector = ({ datosNoAptosPorSector }) => {
    return (
        <div className='bg-white p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="BarChart"
                data={datosNoAptosPorSector}
                options={{
                    title: 'Actividades No Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                        maxValue: Math.max(...datosNoAptosPorSector.slice(1).map(item => item[1])) + 1,
                    },
                    colors: ['#f44336'],
                    legend: { position: 'bottom' },
                }}
                width="100%"
                height="250px"
            />
        </div>
    );
};

export default GraficaNoAptosPorSector;
