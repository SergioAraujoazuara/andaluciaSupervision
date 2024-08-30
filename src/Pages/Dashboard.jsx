import React, { useEffect, useState } from 'react';
import { db } from '../../firebase_config';
import { getDocs, collection } from 'firebase/firestore';
import { FaArrowRight, FaChartPie } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { SiBim } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";

// Importación de componentes personalizados
import GraficaAptosPorSector from '../Graficas/GraficaAptosPorSector ';
import GraficaNoAptosPorSector from '../Graficas/GraficaNoAptosPorSector ';
import ResumenPorNivel from '../Graficas/ResumenPorNivel';
import TargetCard from '../Graficas/TargetCard';
import FiltrosDashboard from '../Components/Filtros/FiltrosDashboard';
import TimelineAptos from '../Graficas/TimeLineAptos';

function Dashboard() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/');
    };

    const [lotes, setLotes] = useState([]);
    const [filterText, setFilterText] = useState('');
    const [filters, setFilters] = useState({
        sector: '',
        subSector: '',
        parte: '',
        elemento: '',
        lote: '',
        ppi: ''
    });
    const [activeView, setActiveView] = useState('graficas');
    const [uniqueValues, setUniqueValues] = useState({
        sector: [],
        subSector: [],
        parte: [],
        elemento: [],
        lote: [],
        ppi: []
    });

    useEffect(() => {
        obtenerLotes();
    }, []);

    const obtenerLotes = async () => {
        try {
            const lotesCollectionRef = collection(db, "lotes");
            const lotesSnapshot = await getDocs(lotesCollectionRef);
            const lotesData = lotesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLotes(lotesData);
            setUniqueValues({
                sector: getUniqueValues(lotesData, 'sectorNombre'),
                subSector: getUniqueValues(lotesData, 'subSectorNombre'),
                parte: getUniqueValues(lotesData, 'parteNombre'),
                elemento: getUniqueValues(lotesData, 'elementoNombre'),
                lote: getUniqueValues(lotesData, 'nombre'),
                ppi: getUniqueValues(lotesData, 'ppiNombre')
            });
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilterText(e.target.value);
    };

    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            sector: '',
            subSector: '',
            parte: '',
            elemento: '',
            lote: '',
            ppi: ''
        });
        setFilterText('');
    };

    const getUniqueValues = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };

    const filteredLotes = lotes.filter(l =>
        (l.nombre.toLowerCase().includes(filterText.toLowerCase()) ||
            l.ppiNombre.toLowerCase().includes(filterText.toLowerCase())) &&
        (filters.sector === '' || l.sectorNombre === filters.sector) &&
        (filters.subSector === '' || l.subSectorNombre === filters.subSector) &&
        (filters.parte === '' || l.parteNombre === filters.parte) &&
        (filters.elemento === '' || l.elementoNombre === filters.elemento) &&
        (filters.lote === '' || l.nombre === filters.lote) &&
        (filters.ppi === '' || l.ppiNombre === filters.ppi)
    );

    const calcularProgresoGeneralObra = () => {
        const totalProgreso = filteredLotes.reduce((sum, lote) => {
            const progresoLote = (lote.actividadesAptas || 0) / (lote.totalSubactividades || 1);
            return sum + progresoLote;
        }, 0);

        if (filteredLotes.length === 0) return 0;
        return ((totalProgreso / filteredLotes.length) * 100).toFixed(2);
    };

    const progresoGeneralObra = calcularProgresoGeneralObra();

    const obtenerDatosAptosPorSector = () => {
        const data = [['Sector', 'Aptos']];
        uniqueValues.sector.forEach(sector => {
            const lotesPorSector = filteredLotes.filter(l => l.sectorNombre === sector);
            let aptos = 0;
            lotesPorSector.forEach(lote => {
                aptos += lote.actividadesAptas || 0;
            });
            data.push([sector, aptos]);
        });
        return data;
    };

    const obtenerDatosNoAptosPorSector = () => {
        const data = [['Sector', 'No Aptos']];
        uniqueValues.sector.forEach(sector => {
            const lotesPorSector = filteredLotes.filter(l => l.sectorNombre === sector);
            let noAptos = 0;
            lotesPorSector.forEach(lote => {
                if (lote.totalSubactividades > 0 && (lote.actividadesAptas > 0 || lote.actividadesNoAptas > 0)) {
                    noAptos += lote.actividadesNoAptas || 0;
                }
            });
            data.push([sector, noAptos]);
        });
        return data;
    };

    // Calculate inspeccionesTerminadas
    const contarInspeccionesTerminadas = () => {
        return filteredLotes.filter(lote => {
            return lote.totalSubactividades > 0 &&
                lote.actividadesAptas === lote.totalSubactividades;
        }).length;
    };

    // Define inspeccionesTerminadas
    const inspeccionesTerminadas = contarInspeccionesTerminadas();

    const datosAptosPorSector = obtenerDatosAptosPorSector();
    const datosNoAptosPorSector = obtenerDatosNoAptosPorSector();

    const isSectorSelected = filters.sector !== '';

    return (
        <div className='container mx-auto min-h-screen xl:px-14 py-2'>
            <div className='flex items-center justify-between bg-white px-5 py-3 text-base'>
                <div className='flex gap-2 items-center'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'/'}>
                        <h1 className='text-gray-500'>Home</h1>
                    </Link>
                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Inspección</h1>
                    </Link>
                </div>
                <div className='flex items-center gap-4'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}>
                        <IoArrowBackCircle />
                    </button>
                </div>
            </div>

            <div className='w-full border-b-2 border-gray-200'></div>

            {/* Vista de gráficos */}
            <div className='flex flex-col items-start justify-center mt-2 bg-white p-4 rounded-xl shadow-lg'>
                <FiltrosDashboard
                    filters={filters}
                    uniqueValues={uniqueValues}
                    filterText={filterText}
                    onFilterChange={handleFilterChange}
                    onSelectChange={handleSelectChange}
                    onClearFilters={handleClearFilters}
                />

                <div className='w-full'>
                    <div className='my-5 flex gap-5'>
                        <TargetCard title="Items inspeccionados:" value={`${progresoGeneralObra}%`} />

                        {!isSectorSelected && (
                            <>
                                <TargetCard title="Inspecciones finalizadas:" value={inspeccionesTerminadas} message={`Inspecciones totales: ${lotes.length}`} />
                                <TargetCard title="Inspecciones iniciadas:" value={lotesIniciados} message={`Porcentaje: ${porcentajeInspeccionesCompletadas}%`} />
                            </>
                        )}
                    </div>

                    {/* Gráficos y mapa */}
                    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4'>
                        <GraficaAptosPorSector datosAptosPorSector={datosAptosPorSector} />
                        <GraficaNoAptosPorSector datosNoAptosPorSector={datosNoAptosPorSector} />
                        <TimelineAptos filteredLotes={filteredLotes} />
                    </div>
                </div>

                {/* Resumen por nivel */}
                {filters.sector ? (
                    <ResumenPorNivel
                        nivel="sector"
                        titulo={`Resumen del Sector: ${filters.sector}`}
                        uniqueValues={{
                            sector: uniqueValues.sector.filter(sector => sector === filters.sector)
                        }}
                        calcularProgresoPorNivel={(nivel, valor) => calcularProgresoPorNivel('sectorNombre', valor)}
                        contarAptos={(nivel, valor) => contarAptos('sectorNombre', valor)}
                        contarNoAptos={(nivel, valor) => contarNoAptos('sectorNombre', valor)}
                    />
                ) : (
                    <ResumenPorNivel
                        nivel="sector"
                        titulo="Resumen de Todos los Sectores"
                        uniqueValues={uniqueValues}
                        calcularProgresoPorNivel={calcularProgresoPorNivel}
                        contarAptos={contarAptos}
                        contarNoAptos={contarNoAptos}
                    />
                )}
            </div>
        </div>
    );
}

export default Dashboard;
