import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { db } from '../../firebase_config';
import { collection, getDocs } from 'firebase/firestore';

const TimelineAptos = ({ filteredLotes }) => {
    const initialData = [
        ['Fecha', 'Sin datos'],  
        [new Date(), 0],        
    ];

    const [dataChart, setDataChart] = useState(initialData);

    useEffect(() => {
        const fetchInspecciones = async () => {
            const aptosPorFechaYSector = {};

            for (const lote of filteredLotes) {
                const inspeccionesRef = collection(db, `lotes/${lote.id}/inspecciones`);
                const inspeccionesSnapshot = await getDocs(inspeccionesRef);

                inspeccionesSnapshot.forEach((doc) => {
                    const inspeccion = doc.data();

                    if (!inspeccion.actividades) {
                        console.warn('Inspección sin actividades:', inspeccion);
                        return;
                    }

                    inspeccion.actividades.forEach((actividad) => {
                        if (!actividad.subactividades) {
                            console.warn('Actividad sin subactividades:', actividad);
                            return;
                        }

                        actividad.subactividades.forEach((subactividad) => {
                            const fecha = subactividad.fecha ? convertirFecha(subactividad.fecha) : null;

                            if (!fecha) {
                                console.warn('Subactividad sin fecha válida:', subactividad);
                                return;
                            }

                            console.log('Fecha procesada:', fecha);

                            const actividadesAptas = lote.actividadesAptas || 0;
                            const sector = lote.sectorNombre || 'Sin sector'; 

                            if (!aptosPorFechaYSector[fecha]) {
                                aptosPorFechaYSector[fecha] = {};
                            }

                            if (!aptosPorFechaYSector[fecha][sector]) {
                                aptosPorFechaYSector[fecha][sector] = 0;
                            }

                            aptosPorFechaYSector[fecha][sector] += actividadesAptas;
                        });
                    });
                });
            }

            if (Object.keys(aptosPorFechaYSector).length === 0) {
                console.warn('No hay datos disponibles para mostrar en el gráfico.');
                setDataChart([['Fecha', 'Sin datos'], [new Date(), 0]]);
                return;
            }

            const sectoresUnicos = [...new Set(filteredLotes.map(lote => lote.sectorNombre || 'Sin sector'))];
            const datosParaGrafico = [['Fecha', ...sectoresUnicos]];

            Object.entries(aptosPorFechaYSector).forEach(([fecha, sectores]) => {
                const fila = [new Date(fecha)];
                sectoresUnicos.forEach(sector => {
                    fila.push(sectores[sector] || 0);
                });
                datosParaGrafico.push(fila);
            });

            if (datosParaGrafico.length <= 1) {
                console.warn('No hay suficientes datos para construir el gráfico.');
                setDataChart([['Fecha', 'Sin datos'], [new Date(), 0]]);
            } else {
                setDataChart(datosParaGrafico);
            }
        };

        fetchInspecciones();
    }, [filteredLotes]);

    // Configuración de las opciones del gráfico
    const options = {
        title: 'Actividades Aptas por Sector y Fecha',
        hAxis: { title: 'Fecha', format: 'dd/MM/yyyy' },
        vAxis: { title: 'Número de Aptos' },
        legend: { position: 'right' },
        curveType: 'function',
        lineWidth: 2,
        pointsVisible: false,
        colors: ['#D9828B', '#D1B000', '#6CA96C', '#809CA7', '#C15656', '#CF7A9A', '#9B87B5', '#D2A68A'],




    };

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
            <Chart
                chartType="LineChart"
                width="100%"
                height="250px"
                data={dataChart}
                options={options}
            />
        </div>
    );
};

export default TimelineAptos;

const convertirFecha = (fechaString) => {
    if (!fechaString) {
        console.error('Fecha inválida:', fechaString);
        return null;
    }

    try {
        const [fechaPart, horaPart] = fechaString.split(', ');
        const [dia, mes, anio] = fechaPart.split('/').map(num => parseInt(num, 10));
        const [hora, minutos, segundos] = horaPart.split(':').map(num => parseInt(num, 10));
        return new Date(anio, mes - 1, dia, hora, minutos, segundos);
    } catch (error) {
        console.error('Error al convertir la fecha:', error);
        return null;
    }
};
