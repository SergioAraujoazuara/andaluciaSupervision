import React, { useEffect, useState } from 'react';
import { db } from '../../firebase_config';
import { getDocs, collection } from 'firebase/firestore';
import { FaArrowRight, FaSearch, FaTimes, FaThLarge, FaTable, FaChartPie } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { SiBim } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";

// Importación de componentes personalizados
import GraficaProgresoGeneral from '../Graficas/GraficaProgresoGeneral';
import GraficaAptosPorSector from '../Graficas/GraficaAptosPorSector ';
import GraficaNoAptosPorSector from '../Graficas//GraficaNoAptosPorSector ';
import ResumenPorNivel from '../Graficas/ResumenPorNivel';
import TargetCard from '../Graficas/TargetCard';
import LeafletMap from '../Graficas/LeafletMap';
import FiltrosDashboard from '../Components/Filtros/FiltrosDashboard';
import FiltrosTabla from '../Components/Filtros/FiltrosTabla';
import VistaTabla from '../Components/Vistas/VistaTabla';
import TimelineAptos from '../Graficas/TimeLineAptos';
import GraficaLotesPorSector from '../Graficas/GraficasLotesPorSector';
import TarjetaNoAptosPorSector from '../Graficas/TarjetaNoAptosPorSector';

// Importar funciones de utilidades
import { getLotes } from '../Functions/getLotes'; // Importar la función de obtención de lotes
import { getInspections } from '../Functions/getInspections'; // Importar la función de obtención de inspecciones
import { getNoAptos } from '../Functions/getNoAptos'; // Importar la función de obtención de inspecciones
import TargetCardNoApto from '../Graficas/TargetCardNoApto';


function Elemento() {
    // Navegación para regresar a la página principal
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/');
    };

    // Estados del componente
    const [lotes, setLotes] = useState([]); // Almacena los lotes obtenidos de la base de datos
    const [filterText, setFilterText] = useState(''); // Almacena el texto de filtro de búsqueda
    const [filters, setFilters] = useState({
        sector: '',
        subSector: '',
        parte: '',
        elemento: '',
        lote: '',
        ppi: ''
    }); // Almacena los filtros seleccionados por el usuario
    const [isTableView, setIsTableView] = useState(true); // Estado para alternar entre vista de tabla y tarjetas
    const [showSector, setShowSector] = useState(true); // Estado para mostrar/ocultar el sector en la tabla
    const [activeView, setActiveView] = useState('tabla'); // Estado para alternar entre vista de tabla y gráficos

    const [uniqueValues, setUniqueValues] = useState({
        sector: [],
        subSector: [],
        parte: [],
        elemento: [],
        lote: [],
        ppi: []
    }); // Almacena los valores únicos para cada filtro

    // Estados para "No Aptos"
    const [noAptosPorSector, setNoAptosPorSector] = useState({});
    const [totalNoAptos, setTotalNoAptos] = useState(0);
    const [sectorSeleccionado, setSectorSeleccionado] = useState('Todos');

    useEffect(() => {
        fetchLotes();
    }, []);

    const fetchLotes = async () => {
        try {
            const lotesData = await getLotes();
            setLotes(lotesData);
            setUniqueValues({
                sector: getUniqueValues(lotesData, 'sectorNombre'),
                subSector: getUniqueValues(lotesData, 'subSectorNombre'),
                parte: getUniqueValues(lotesData, 'parteNombre'),
                elemento: getUniqueValues(lotesData, 'elementoNombre'),
                lote: getUniqueValues(lotesData, 'nombre'),
                ppi: getUniqueValues(lotesData, 'ppiNombre')
            });

            // Obtener y calcular "No Aptos" utilizando la función `getNoAptos`
        const { noAptosPorSector, totalNoAptos } = await getNoAptos(lotesData);

        // Aquí agregamos el console.log para ver el conteo de inspecciones no aptas
        console.log('No Aptos por Sector:', noAptosPorSector);
        console.log('Total No Aptos:', totalNoAptos);
            setNoAptosPorSector(noAptosPorSector);
            setTotalNoAptos(totalNoAptos);
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    };

    // Función para obtener valores únicos de una propiedad específica de los lotes
    const getUniqueValues = (data, key) => {
        return [...new Set(data.map(item => item[key]))];
    };
    // Función para manejar la trazabilidad de los lotes seleccionados y guardar en localStorage
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

    // Función para manejar cambios en el filtro de texto
    const handleFilterChange = (e) => {
        setFilterText(e.target.value);
    };

    // Función para manejar cambios en los selectores de filtro
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    // Función para limpiar todos los filtros
    const handleClearFilters = () => {
        setFilters({
            sector: '',
            subSector: '',
            parte: '',
            elemento: '',
            lote: '',
            ppi: ''
        });
        setFilterText(''); // Limpiar el texto de filtro
    };


    // Filtrado de lotes según los filtros y el texto de búsqueda
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

    // Cálculo del progreso general
    const calcularProgresoGeneral = () => {
        const totalLotes = filteredLotes.length;
        const progresoTotal = filteredLotes.reduce((sum, lote) => {
            const avance = (lote.actividadesAptas || 0) / lote.totalSubactividades;
            return sum + (avance * 100);
        }, 0);
        return (progresoTotal / totalLotes).toFixed(2);
    };


    // Obtención de datos de actividades aptas por sector
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

    // Obtención de datos de actividades no aptas por sector
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

    // Contar actividades aptas para un nivel y valor específicos
    const contarAptos = (nivel, valor) => {
        return filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + (lote.actividadesAptas || 0), 0);
    };

    // Contar actividades no aptas para un nivel y valor específicos
    const contarNoAptos = (nivel, valor) => {
        return filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + (lote.actividadesNoAptas || 0), 0);
    };

    // Calcular el progreso por nivel
    const calcularProgresoPorNivel = (nivel, valor) => {
        const totalSubactividades = filteredLotes
            .filter(l => l[nivel] === valor)
            .reduce((sum, lote) => sum + lote.totalSubactividades, 0);

        const actividadesAptas = contarAptos(nivel, valor);

        return totalSubactividades > 0
            ? ((actividadesAptas / totalSubactividades) * 100).toFixed(2)
            : 0;
    };

    // Variables de control para los KPI

    // Variables para contar lotes e inspecciones
    const totalLotes = lotes.filter(l => l.ppiNombre).length;
    const lotesIniciados = lotes.filter(l =>
        (l.actividadesAptas > 0 || l.actividadesNoAptas > 0) && l.totalSubactividades > 0
    ).length;

    // Datos para las gráficas de aptos y no aptos por sector
    const datosAptosPorSector = obtenerDatosAptosPorSector();
    const datosNoAptosPorSector = obtenerDatosNoAptosPorSector();

    const totalAptos = datosAptosPorSector.slice(1).reduce((sum, sector) => sum + sector[1], 0);
    // const totalNoAptos = datosNoAptosPorSector.slice(1).reduce((sum, sector) => sum + sector[1], 0);

    console.log(totalNoAptos)

    // Cálculo del porcentaje de inspecciones completadas
    const calcularPorcentajeInspeccionesCompletadas = () => {
        if (totalLotes === 0) return 0;
        return ((lotesIniciados / totalLotes) * 100).toFixed(2);
    };

    const porcentajeInspeccionesCompletadas = calcularPorcentajeInspeccionesCompletadas();

    // Cálculo del porcentaje de elementos aptos
    const totalSubactividadesInspeccionadas = filteredLotes.reduce((sum, lote) => sum + (lote.totalSubactividades || 0), 0);
    const totalSubactividadesAptas = filteredLotes.reduce((sum, lote) => sum + (lote.actividadesAptas || 0), 0);

    const calcularPorcentajeElementosAptos = () => {
        if (totalSubactividadesInspeccionadas === 0) return 0;
        return ((totalSubactividadesAptas / totalSubactividadesInspeccionadas) * 100).toFixed(2);
    };


    // Cálculo del porcentaje de inspecciones pendientes
    const totalInspecciones = lotes.length; // Total de lotes o inspecciones disponibles
    const inspeccionesPendientes = totalInspecciones - lotesIniciados;

    const calcularPorcentajeInspeccionesPendientes = () => {
        if (totalLotes === 0) return 0;
        return ((inspeccionesPendientes / totalLotes) * 100).toFixed(2);
    };


    // Cálculo del progreso general de la obra
    const calcularProgresoGeneralObra = () => {
        const totalProgreso = filteredLotes.reduce((sum, lote) => {
            const progresoLote = (lote.actividadesAptas || 0) / (lote.totalSubactividades || 1);
            return sum + progresoLote;
        }, 0);

        if (filteredLotes.length === 0) return 0;
        return ((totalProgreso / filteredLotes.length) * 100).toFixed(2);
    };

    const progresoGeneralObra = calcularProgresoGeneralObra();


    // Función para contar las inspecciones terminadas (todas las subactividades son aptas)
    const contarInspeccionesTerminadas = () => {
        return filteredLotes.filter(lote => {
            // Consideramos que una inspección está terminada si todas las subactividades son aptas
            return lote.totalSubactividades > 0 &&
                lote.actividadesAptas === lote.totalSubactividades;
        }).length;
    };

    // Obtener el número de inspecciones terminadas
    const inspeccionesTerminadas = contarInspeccionesTerminadas();


    // Verifica si se seleccionó un sector específico
    const isSectorSelected = filters.sector !== '';

    return (
        <div className='container mx-auto min-h-screen xl:px-14 py-2'>
            {/* Barra de navegación */}
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

                    <div className='flex gap-3'>

                        {/* <button
                            className="px-4 py-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-colors"
                            onClick={() => setActiveView('tabla')}
                        >
                            <FaTable />
                        </button>
                        <button
                            className="px-4 py-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-colors"
                            onClick={() => setActiveView('graficas')}
                        >
                            <FaChartPie />
                        </button> */}
                        <div >
                            <Link to={'/visor_inspeccion'}>
                                <button className='text-white bg-sky-600 flex items-center px-4 py-2 rounded-lg'>
                                    <span className='text-2xl'><SiBim /> </span>
                                </button>
                            </Link>

                        </div>
                    </div>



                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>
            </div>

            <div className='w-full border-b-2 border-gray-200'></div>

            {/* Condicional para mostrar la vista de tabla */}
            {activeView === 'tabla' && (
                <div className='flex flex-col items-start justify-center mt-2 bg-white p-4 rounded-xl shadow-lg'>
                    {/* Filtros para la vista de tabla */}
                    <FiltrosTabla
                        filters={filters}
                        uniqueValues={uniqueValues}
                        filterText={filterText}
                        onFilterChange={handleFilterChange}
                        onSelectChange={handleSelectChange}
                        onClearFilters={handleClearFilters}
                    />



                    {/* Componente VistaTabla para mostrar los lotes en tabla o tarjetas */}
                    <VistaTabla
                        filteredLotes={filteredLotes}
                        showSector={showSector}
                        handleCaptrurarTrazabilidad={handleCaptrurarTrazabilidad}
                        isTableView={isTableView}
                    />
                </div>
            )}

            {/* Condicional para mostrar la vista de gráficos */}
            {activeView === 'graficas' && (
                <div className='flex flex-col items-start justify-center mt-2 bg-white p-4 rounded-xl shadow-lg'>
                    {/* Filtros para la vista de gráficos */}
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
                            {/* TargetCards para mostrar métricas generales */}
                            <TargetCard
                                title="Items inspeccionados:"
                                value={`${progresoGeneralObra}%`}
                            />


                            {!isSectorSelected && (
                                <>

                                    <TargetCard title="Inspecciones finalizadas:"
                                        value={
                                            <div>{inspeccionesTerminadas}</div>
                                        }
                                        message={
                                            <div>{`Inspecciones totales: ${totalLotes}`}</div>
                                        } />

                                    <TargetCard
                                        title="Inspecciones iniciadas:"
                                        value={
                                            <div>{`${lotesIniciados}`}</div>
                                        }
                                        message={
                                            <div>{`Porcentaje: ${porcentajeInspeccionesCompletadas} %`}</div>
                                        }
                                    />

                                </>
                            )}
                           <TarjetaNoAptosPorSector  filteredLotes={filteredLotes}/>








                        </div>

                        {/* Gráficos y mapa */}
                        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4'>

                            <GraficaAptosPorSector datosAptosPorSector={datosAptosPorSector} />
                            <GraficaNoAptosPorSector datosNoAptosPorSector={datosNoAptosPorSector} />
                            <TimelineAptos filteredLotes={filteredLotes} getInspections={getInspections} />
                            <GraficaLotesPorSector lotes={lotes} filteredLotes={filteredLotes} />

                        </div>
                    </div>

                    {/* Resumen por nivel */}
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
