import React from 'react';
import { Chart } from "react-google-charts";

const GraficaProgresoGeneral = ({ progresoGeneral }) => {
    return (
        <div className='bg-white p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="PieChart"
                data={[
                    ['Progreso', 'Porcentaje'],
                    ['Progreso Completo', parseFloat(progresoGeneral)],
                    ['Restante', 100 - parseFloat(progresoGeneral)]
                ]}
                options={{
                    title: 'Progreso General de la Obra',
                    pieHole: 0.4,
                    slices: [
                        { color: '#d97706' },
                        { color: '#e0e0e0' }
                    ],
                    legend: { position: 'bottom' },
                }}
                width="100%"
                height="250px"
            />
        </div>
    );
};

export default GraficaProgresoGeneral;




