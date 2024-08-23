import React from 'react';
import { Chart } from "react-google-charts";

const GraficaAptosPorSector = ({ datosAptosPorSector }) => {
    return (
        <div className='bg-white p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="BarChart"
                data={datosAptosPorSector}
                options={{
                    title: 'Actividades Aptas por Sector',
                    hAxis: {
                        minValue: 0,
                        maxValue: Math.max(...datosAptosPorSector.slice(1).map(item => item[1])) + 1,
                    },
                    colors: ['#4caf50'],
                    legend: { position: 'bottom' },
                }}
                width="100%"
                height="250px"
            />
        </div>
    );
};

export default GraficaAptosPorSector;
