import React, { useEffect, useState } from 'react';
import { db } from '../../firebase_config';
import { getDocs, collection } from 'firebase/firestore';
import { FaArrowRight, FaSearch, FaTimes, FaThLarge, FaTable, FaChartPie } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { SiBim } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";

import GraficaProgresoGeneral from '../Graficas/GraficaProgresoGeneral';
import GraficaAptosPorSector from '../Graficas/GraficaAptosPorSector ';
import GraficaNoAptosPorSector from '../Graficas/GraficaNoAptosPorSector ';
import ResumenPorNivel from '../Graficas/ResumenPorNivel';
import TargetCard from '../Graficas/TargetCard';
import LeafletMap from '../Graficas/LeafletMap';

function Elemento() {
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
    const [isTableView, setIsTableView] = useState(true);
    const [showSector, setShowSector] = useState(true);
    const [activeView, setActiveView] = useState('tabla');

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

    const handleCaptrurarTrazabilidad = (l) => {
        localStorage.setItem('sector', l.sectorNombre || '');
        localStorage.setItem('subSector', l.subSectorNombre || '');
        localStorage.setItem('parte', l.parteNombre || '');
        localStorage.setItem('elemento', l.elementoNombre || '');
        localStorage.setItem('lote', l.nombre || '');
        localStorage.setItem('loteId', l.id || '');
        localStorage.setItem('ppi', l.ppiNombre || '');
        localStorage.setItem('pkInicial', l.pkInicial || '');
        localStorage.setItem('pkFinal', l.pkFinal || '');
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

    const toggleView = () => {
        setIsTableView(!isTableView);
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

    const calcularProgresoGeneral = () => {
        const totalLotes = filteredLotes.length;
        const progresoTotal = filteredLotes.reduce((sum, lote) => {
            const avance = (lote.actividadesAptas || 0) / lote.totalSubactividades;
            return sum + (avance * 100);
        }, 0);
        return (progresoTotal / totalLotes).toFixed(2);
    };

    const progresoGeneral = calcularProgresoGeneral();

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

    const contarAptos = (nivel, valor) => {
        return filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + (lote.actividadesAptas || 0), 0);
    };

    const contarNoAptos = (nivel, valor) => {
        return filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + (lote.actividadesNoAptas || 0), 0);
    };

    const calcularProgresoPorNivel = (nivel, valor) => {
        const totalSubactividades = filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + lote.totalSubactividades, 0);

        const actividadesAptas = contarAptos(nivel, valor);

        return totalSubactividades > 0
            ? ((actividadesAptas / totalSubactividades) * 100).toFixed(2)
            : 0;
    };

    const renderResumenPorNivel = (nivel, titulo) => (
        <div className="w-full mb-8">
            <h3 className="w-full bg-sky-600 text-white text-lg font-semibold px-4 py-2 rounded-t-lg">{titulo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white p-4 rounded-b-lg shadow-md">
                {uniqueValues[nivel].map((valor, index) => {
                    const progreso = calcularProgresoPorNivel(`${nivel}Nombre`, valor);

                    return (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-md font-semibold text-gray-700">{valor}</span>
                                <div className="relative w-10 h-10">
                                    <svg viewBox="0 0 36 36" className="w-full h-full">
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="4"
                                        />
                                        <path
                                            d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831"
                                            fill="none"
                                            stroke="#34d399"
                                            strokeWidth="4"
                                            strokeDasharray={`${progreso}, 100`}
                                        />
                                        <text x="18" y="20.35" className="text-xs" fill="#333" textAnchor="middle" dominantBaseline="middle">
                                            {progreso}%
                                        </text>
                                    </svg>
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-green-600">Aptos:</span>
                                    <span>{contarAptos(`${nivel}Nombre`, valor)}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-medium text-red-600">No Aptos:</span>
                                    <span>{contarNoAptos(`${nivel}Nombre`, valor)}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-300 h-2 rounded-full">
                                    <div
                                        className="bg-sky-600 h-2 rounded-full"
                                        style={{
                                            width: `${progreso}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const totalLotes = lotes.filter(l => l.ppiNombre).length;
    const lotesIniciados = lotes.filter(l =>
        (l.actividadesAptas > 0 || l.actividadesNoAptas > 0) && l.totalSubactividades > 0
    ).length;

    const datosAptosPorSector = obtenerDatosAptosPorSector();
    const datosNoAptosPorSector = obtenerDatosNoAptosPorSector();

    const totalAptos = datosAptosPorSector.slice(1).reduce((sum, sector) => sum + sector[1], 0);
    const totalNoAptos = datosNoAptosPorSector.slice(1).reduce((sum, sector) => sum + sector[1], 0);


    const calcularPorcentajeInspeccionesCompletadas = () => {
        if (totalLotes === 0) return 0;
        return ((lotesIniciados / totalLotes) * 100).toFixed(2);
    };

    const porcentajeInspeccionesCompletadas = calcularPorcentajeInspeccionesCompletadas();


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const totalSubactividadesInspeccionadas = filteredLotes.reduce((sum, lote) => sum + (lote.totalSubactividades || 0), 0);
    const totalSubactividadesAptas = filteredLotes.reduce((sum, lote) => sum + (lote.actividadesAptas || 0), 0);

    const calcularPorcentajeElementosAptos = () => {
        if (totalSubactividadesInspeccionadas === 0) return 0;
        return ((totalSubactividadesAptas / totalSubactividadesInspeccionadas) * 100).toFixed(2);
    };

    const porcentajeElementosAptos = calcularPorcentajeElementosAptos();

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const totalInspecciones = lotes.length; // Total de lotes o inspecciones disponibles
    const inspeccionesPendientes = totalInspecciones - lotesIniciados;

    const calcularPorcentajeInspeccionesPendientes = () => {
        if (totalLotes === 0) return 0;
        return ((inspeccionesPendientes / totalLotes) * 100).toFixed(2);
    };

    const porcentajeInspeccionesPendientes = calcularPorcentajeInspeccionesPendientes();



    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const calcularProgresoGeneralObra = () => {
        const totalProgreso = filteredLotes.reduce((sum, lote) => {
            const progresoLote = (lote.actividadesAptas || 0) / (lote.totalSubactividades || 1);
            return sum + progresoLote;
        }, 0);

        if (filteredLotes.length === 0) return 0;
        return ((totalProgreso / filteredLotes.length) * 100).toFixed(2);
    };

    const progresoGeneralObra = calcularProgresoGeneralObra();



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
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>
                    <div className='px-4 bg-sky-500 text-white rounded-md'>
                        <Link to={'/visor_inspeccion'}>
                            <button className='text-white flex items-center gap-3'>
                                <span className='text-2xl'><SiBim /> </span>
                            </button>
                        </Link>
                    </div>
                    <button
                        className="ml-4 p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-colors"
                        onClick={() => setActiveView('tabla')}
                    >
                        <FaTable />
                    </button>
                    <button
                        className="ml-4 p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-colors"
                        onClick={() => setActiveView('graficas')}
                    >
                        <FaChartPie />
                    </button>
                </div>
            </div>

            <div className='w-full border-b-2 border-gray-200'></div>

            {activeView === 'tabla' && (
                <div className='flex flex-col items-start justify-center mt-2 bg-white p-4 rounded-xl shadow-lg'>
                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 text-sm'>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                                placeholder="Lote o PPI"
                                value={filterText}
                                onChange={handleFilterChange}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                        </div>
                        <select
                            name="sector"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.sector}
                            onChange={handleSelectChange}
                        >
                            <option value="">Sector</option>
                            {uniqueValues.sector.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <select
                            name="subSector"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.subSector}
                            onChange={handleSelectChange}
                        >
                            <option value="">Sub Sector</option>
                            {uniqueValues.subSector.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <select
                            name="parte"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.parte}
                            onChange={handleSelectChange}
                        >
                            <option value="">Parte</option>
                            {uniqueValues.parte.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <select
                            name="elemento"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.elemento}
                            onChange={handleSelectChange}
                        >
                            <option value="">Elemento</option>
                            {uniqueValues.elemento.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <select
                            name="lote"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.lote}
                            onChange={handleSelectChange}
                        >
                            <option value="">Lote</option>
                            {uniqueValues.lote.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <select
                            name="ppi"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.ppi}
                            onChange={handleSelectChange}
                        >
                            <option value="">PPI</option>
                            {uniqueValues.ppi.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                        <button
                            className="w-full p-2 bg-gray-500 text-white rounded-lg flex items-center justify-center gap-2"
                            onClick={handleClearFilters}
                        >
                            <FaTimes />
                            Borrar filtros
                        </button>
                    </div>

                    <div className='flex justify-between items-center my-4'>
                        <button
                            className='flex items-center text-sm text-white bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600'
                            onClick={toggleView}
                        >
                            {isTableView ? <FaThLarge /> : <FaTable />}
                            {isTableView ? " Ver como Tarjetas" : " Ver como Tabla"}
                        </button>
                    </div>

                    {isTableView ? (
                        <div className="w-full rounded-xl">
                            <div className='grid sm:grid-cols-12 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-200'>
                                {showSector &&
                                    <div className='text-left font-medium text-gray-600 sm:block hidden px-2'>
                                        Sector
                                    </div>
                                }
                                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-6'>Sub Sector</div>
                                <div className='text-left font-medium text-gray-600 sm:block hidden px-2'>Parte</div>
                                <div className='text-left font-medium text-gray-600 col-span-1 sm:block hidden px-2'>Elemento</div>
                                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-2'>Pk</div>
                                <div className='text-left font-medium text-gray-600 col-span-3 sm:block hidden px-2'>Lote y ppi</div>
                                <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden px-2'>Progreso inspección</div>
                            </div>

                            {filteredLotes.sort((a, b) => {
                                const avanceA = (a.actividadesAptas || 0) / a.totalSubactividades;
                                const avanceB = (b.actividadesAptas || 0) / b.totalSubactividades;
                                return avanceB - avanceA;
                            }).map((l, i) => (
                                <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)} key={i}>
                                    <div className='w-full grid grid-cols-1 xl:grid-cols-12 gap-1 items-center text-sm cursor-pointer p-5 border border-b-2 font-normal text-gray-600 hover:bg-gray-100'>
                                        {showSector &&
                                            <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                                                <p className='xl:hidden font-ligth'>Sector: </p>{l.sectorNombre}</div>}
                                        <div className='w-full xl:col-span-2 flex xl:block gap-2 px-2'>
                                            <p className='xl:hidden font-ligth'>Sub sector: </p>{l.subSectorNombre}</div>
                                        <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                                            <p className='xl:hidden font-ligth'>Parte: </p>{l.parteNombre}</div>
                                        <div className='w-full xl:col-span-1 flex xl:block gap-2 px-2'>
                                            <p className='xl:hidden font-ligth'>Elemento: </p>{l.elementoNombre}</div>
                                        <div className='w-full xl:col-span-2 xl:text-start flex flex-col xl:flex-row xl:justify-start px-2 gap-2'>
                                            <div className='w-full xl:w-auto'><p className='font-ligth'>Pk Inicial: {l.pkInicial || '-'}</p></div>
                                            <div className='w-full xl:w-auto'><p className='font-ligth'>Pk Final: {l.pkFinal || '-'}</p></div>
                                        </div>
                                        <div className='w-full flex flex-col items-start justify-center xl:col-span-3 px-2'>
                                            <div className='flex gap-2 items-center'>
                                                <p className='font-medium'>Lote:</p>
                                                <p className='font-medium'>{l.nombre}</p>
                                            </div>
                                            <div className='flex gap-2 mt-1'>
                                                <p className='font-medium'>Ppi:</p>
                                                <p className='font-medium'>{l.ppiNombre}</p>
                                            </div>
                                        </div>
                                        <div className='w-full xl:col-span-2 px-2'>
                                            {l.totalSubactividades > 0 ? (
                                                <div className='text-start flex flex-col items-start gap-3'>
                                                    <div className='font-medium text-gray-600'>
                                                        {((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%</div>
                                                    <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '100%' }}>
                                                        <div style={{
                                                            background: '#d97706',
                                                            height: '100%',
                                                            borderRadius: '8px',
                                                            width: `${((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%`
                                                        }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className='font-medium text-green-600'>{` Apto: ${l.actividadesAptas || 0}`}</p>
                                                        <p className='font-medium text-red-700'>{`No Apto: ${l.actividadesNoAptas || 0}`}</p>
                                                    </div>
                                                </div>
                                            ) : "Inspección no iniciada"}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredLotes.map((l, i) => (
                                <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)} key={i}>
                                    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                                        <h3 className="text-lg font-bold mb-2">{l.nombre}</h3>
                                        <p className="text-gray-600">Sector: {l.sectorNombre}</p>
                                        <p className="text-gray-600">Subsector: {l.subSectorNombre}</p>
                                        <p className="text-gray-600">Parte: {l.parteNombre}</p>
                                        <p className="text-gray-600">Elemento: {l.elementoNombre}</p>
                                        <p className="text-gray-600">PK: {l.pkInicial || '-'} - {l.pkFinal || '-'}</p>
                                        <p className="mt-2 text-gray-600">Aptos: {l.actividadesAptas || 0}</p>
                                        <p className="mt-2 text-gray-600">No Aptos: {l.actividadesNoAptas || 0}</p>
                                        {l.totalSubactividades > 0 ? (
                                            <div className="mt-4">
                                                <div className="font-medium text-gray-600">
                                                    Progreso: {((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%
                                                </div>
                                                <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '100%' }}>
                                                    <div style={{
                                                        background: '#d97706',
                                                        height: '100%',
                                                        borderRadius: '8px',
                                                        width: `${((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%`
                                                    }}
                                                    />
                                                </div>
                                            </div>
                                        ) : <p className="text-gray-500 mt-4">Inspección no iniciada</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeView === 'graficas' && (
                <div className='flex flex-col items-start justify-center mt-2 bg-white p-4 rounded-xl shadow-lg'>
                    <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 text-sm'>
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-lg pl-10"
                                placeholder="Lote o PPI"
                                value={filterText}
                                onChange={handleFilterChange}
                            />
                            <FaSearch className="absolute left-3 top-3 text-gray-400 text-sm" />
                        </div>
                        <select
                            name="sector"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={filters.sector}
                            onChange={handleSelectChange}
                        >
                            <option value="">Sector</option>
                            {uniqueValues.sector.map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>

                        <button
                            className="w-full p-2 bg-gray-500 text-white rounded-lg flex items-center justify-center gap-2"
                            onClick={handleClearFilters}
                        >
                            <FaTimes />
                            Borrar filtros
                        </button>
                    </div>

                    <div className='w-full'>
                        <div className='my-5 flex gap-5'>
                            <TargetCard
                                title="Progreso de avance"
                                value={`${progresoGeneralObra}%`}
                            />

                            {!isSectorSelected && (
                                <>
                                    <TargetCard title="Inspecciones totales" value={totalLotes} />
                                    <TargetCard title="Inspecciones iniciadas" value={lotesIniciados} />
                                    <TargetCard title="Porcentaje Inspecciones iniciadas" value={`${porcentajeInspeccionesCompletadas}%`} />
                                </>
                            )}

                            <TargetCard
                                title="Elementos Aptos"
                                value={
                                    <div className='w-full'>
                                        <div>{porcentajeElementosAptos} %</div>
                                    </div>
                                }
                            />
                            <TargetCard
                                title="Inspecciones pendientes (sin iniciar)"
                                value={
                                    <div className='w-full'>
                                       
                                        <div>{`${inspeccionesPendientes} / ${totalInspecciones}`}</div>
                                       
                                    </div>
                                }
                                messagge={`${porcentajeInspeccionesPendientes} %`}
                                
                            />
                        </div>


                        <div className='w-full grid grid-cols-3'>
                            <div className='col-span-1'>
                                <LeafletMap />
                            </div>

                            <div className='col-span-2'>
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4'>
                                    <GraficaProgresoGeneral progresoGeneral={progresoGeneral} />
                                    <GraficaAptosPorSector datosAptosPorSector={datosAptosPorSector} />
                                    <GraficaNoAptosPorSector datosNoAptosPorSector={datosNoAptosPorSector} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Usa el nuevo componente para renderizar el resumen por nivel */}
                    {(filters.sector ? (
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
))}


                </div>
            )}
        </div>
    );
}

export default Elemento;
