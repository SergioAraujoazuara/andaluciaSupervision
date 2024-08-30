import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_config'; 
import TargetCard from '../Graficas/TargetCard';

const TotalNoAptosPorSector = ({ filteredLotes }) => { // Usar filteredLotes como prop

    const [datosSubactividades, setDatosSubactividades] = useState([]);
    const [noAptosPorSector, setNoAptosPorSector] = useState({});
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');
    const [totalNoAptos, setTotalNoAptos] = useState(0);

    // Función para obtener los campos 'fecha', 'resultadoInspeccion', y 'sector' de todas las subactividades de todas las inspecciones
    const obtenerDatosSubactividades = async (arrayLotes) => {
        try {
            const promesasLotes = arrayLotes.map(async (lote) => {
                const inspeccionesRef = collection(db, `lotes/${lote.id}/inspecciones`);
                const inspeccionesSnapshot = await getDocs(inspeccionesRef);

                // Extraer 'sector' del nivel del lote
                const sector = lote.sectorNombre;

                return inspeccionesSnapshot.docs.flatMap((doc) => {
                    const inspeccionData = doc.data();

                    if (inspeccionData.actividades && Array.isArray(inspeccionData.actividades)) {
                        return inspeccionData.actividades.flatMap((actividad) => {
                            if (actividad.subactividades && Array.isArray(actividad.subactividades)) {
                                // Extraer 'resultadoInspeccion' y 'numero' de cada subactividad
                                return actividad.subactividades
                                    .filter((subactividad) => subactividad.fecha && subactividad.resultadoInspeccion)
                                    .map(({ resultadoInspeccion, numero }) => ({ resultadoInspeccion, sector, numero })); // Agregar 'sector' desde el lote
                            }
                            return [];
                        });
                    }
                    return [];
                });
            });

            // Ejecutar todas las promesas en paralelo
            const resultados = (await Promise.all(promesasLotes)).flat();
            setDatosSubactividades(resultados); // Guardar los resultados en el estado

        } catch (error) {
            console.error('Error al obtener los datos de subactividades:', error);
        }
    };

    // Calcular el total de "No Aptos" activos y agruparlos por sector
    const calcularNoAptosPorSector = () => {
        const noAptosPorSectorTemp = {};
        let totalNoAptosTemp = 0;

        // Agrupar las inspecciones por el campo 'numero'
        const inspeccionesPorNumero = datosSubactividades.reduce((acc, inspeccion) => {
            const { numero } = inspeccion;
            if (!acc[numero]) {
                acc[numero] = [];
            }
            acc[numero].push(inspeccion);
            return acc;
        }, {});

        // Filtrar los "No apto" activos
        Object.values(inspeccionesPorNumero).forEach((inspecciones) => {
            const ultimaInspeccion = inspecciones[inspecciones.length - 1]; // Obtener la última inspección del grupo
            if (ultimaInspeccion.resultadoInspeccion === 'No apto') {
                totalNoAptosTemp += 1;
                const sector = ultimaInspeccion.sector;
                if (!noAptosPorSectorTemp[sector]) {
                    noAptosPorSectorTemp[sector] = 0;
                }
                noAptosPorSectorTemp[sector] += 1;
            }
        });

        setNoAptosPorSector(noAptosPorSectorTemp);
        setTotalNoAptos(totalNoAptosTemp);
    };

    useEffect(() => {
        if (filteredLotes.length > 0) { // Usar filteredLotes
            obtenerDatosSubactividades(filteredLotes); // Pasar filteredLotes
        }
    }, [filteredLotes]); // Dependencia de filteredLotes

    useEffect(() => {
        if (datosSubactividades.length > 0) {
            calcularNoAptosPorSector();
        }
    }, [datosSubactividades]);

    // Manejar cambios en el filtro de sector
    const handleSectorChange = (e) => {
        setSectorSeleccionado(e.target.value);
    };

    return (
        <div className='bg-gray-200 p-4 rounded-lg shadow-lg'>
            {/* Filtro de Sector */}
            <div className='mb-4'>
                <select id='sector-select' className='rounded-lg p-1 bg-gray-100' value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value='Todos'>Todos</option>
                    {Object.keys(noAptosPorSector).map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                    ))}
                </select>
            </div>

            {/* Tarjeta para mostrar el total de No Aptos */}
            <TargetCard 
                title={`Total de "No Aptos" ${sectorSeleccionado === 'Todos' ? '' : `en ${sectorSeleccionado}`}:`}
                value={sectorSeleccionado === 'Todos' ? totalNoAptos : noAptosPorSector[sectorSeleccionado] || 0}
            />
        </div>
    );
};

export default TotalNoAptosPorSector;
