import React, { useEffect, useState } from 'react';
import { db } from '../../firebase_config';
import { getDocs, collection } from 'firebase/firestore';
import { FaArrowRight, FaSearch, FaTimes } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { SiBim } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";

function Elemento() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/'); // Esto navega hacia atrás en la historia
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
    const [showSector, setShowSector] = useState(true);

    const [uniqueValues, setUniqueValues] = useState({
        sector: [],
        subSector: [],
        parte: [],
        elemento: [],
        lote: [],
        ppi: []
    });

    // Llamar elementos de la base de datos
    useEffect(() => {
        obtenerLotes();
    }, []);

    // Obtener lotes
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
        localStorage.setItem('sector', l.sectorNombre || '')
        localStorage.setItem('subSector', l.subSectorNombre || '')
        localStorage.setItem('parte', l.parteNombre || '')
        localStorage.setItem('elemento', l.elementoNombre || '')
        localStorage.setItem('lote', l.nombre || '')
        localStorage.setItem('loteId', l.id || '')
        localStorage.setItem('ppi', l.ppiNombre || '')
        localStorage.setItem('pkInicial', l.pkInicial || '')
        localStorage.setItem('pkFinal', l.pkFinal || '')
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

    useEffect(() => {
        const filteredLotes = lotes.filter(l =>
            (filters.sector === '' || l.sectorNombre === filters.sector) &&
            (filters.subSector === '' || l.subSectorNombre === filters.subSector) &&
            (filters.parte === '' || l.parteNombre === filters.parte) &&
            (filters.elemento === '' || l.elementoNombre === filters.elemento) &&
            (filters.lote === '' || l.nombre === filters.lote) &&
            (filters.ppi === '' || l.ppiNombre === filters.ppi)
        );

        setUniqueValues({
            sector: getUniqueValues(filteredLotes, 'sectorNombre'),
            subSector: getUniqueValues(filteredLotes, 'subSectorNombre'),
            parte: getUniqueValues(filteredLotes, 'parteNombre'),
            elemento: getUniqueValues(filteredLotes, 'elementoNombre'),
            lote: getUniqueValues(filteredLotes, 'nombre'),
            ppi: getUniqueValues(filteredLotes, 'ppiNombre')
        });
    }, [filters]);

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

    const toggleSector = () => {
        setShowSector(prevShowSector => !prevShowSector);
    };

    return (
        <div className='container mx-auto min-h-screen px-14 py-5'>

            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded-xl shadow-md text-base'>
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
                    <div className='px-4 bg-sky-600 text-white rounded-full'>
                        <Link to={'/visor_inspeccion'}>
                            <button className='text-white flex items-center gap-3'>
                                <span className='text-2xl'><SiBim /> </span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-4 rounded-xl shadow-md'>
                    <div className='w-full mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 text-sm'>
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
                            className="w-full p-1 border border-gray-300 rounded-lg"
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



                    <div className="w-full rounded-xl">
                        <div className='grid sm:grid-cols-12 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-200 rounded-md'>
                            {showSector &&
                                <div className='text-left font-medium text-gray-600 sm:block hidden'>
                                    Sector
                                </div>
                            }
                            <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden'>Sub Sector</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden'>Parte</div>
                            <div className='text-left font-medium text-gray-600 col-span-1 sm:block hidden'>Elemento</div>
                            <div className='text-center font-medium text-gray-600 col-span-2 sm:block hidden'>Pk</div>
                            <div className='text-left font-medium text-gray-600 col-span-3 sm:block hidden'>Lote y ppi</div>
                            <div className='text-left font-medium text-gray-600 col-span-2 sm:block hidden'>Progreso inspección</div>
                        </div>

                        {filteredLotes.sort((a, b) => {
                            const avanceA = (a.actividadesAptas || 0) / a.totalSubactividades;
                            const avanceB = (b.actividadesAptas || 0) / b.totalSubactividades;
                            return avanceB - avanceA; // Orden descendente: de mayor a menor avance
                        }).map((l, i) => (
                            <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)} key={i}>
                                <div className='w-full grid grid-cols-1 xl:grid-cols-12 items-center text-sm cursor-pointer p-5 border-b-2 font-normal text-gray-600 hover:bg-gray-100'>
                                    {showSector &&
                                        <div className='w-full xl:col-span-1 flex xl:block gap-2'>
                                            <p className='xl:hidden font-medium'>Sector: </p>{l.sectorNombre}
                                        </div>
                                    }
                                    <div className='w-full xl:col-span-2 flex xl:block gap-2'>
                                        <p className='xl:hidden font-medium'>Sub sector: </p>{l.subSectorNombre}
                                    </div>
                                    <div className='w-full xl:col-span-1 flex xl:block gap-2'>
                                        <p className='xl:hidden font-medium'>Parte: </p>{l.parteNombre}
                                    </div>
                                    <div className='w-full xl:col-span-1 flex xl:block gap-2'>
                                        <p className='xl:hidden font-medium'>Elemento: </p>{l.elementoNombre}
                                    </div>
                                    <div className='w-full xl:col-span-2 xl:text-center flex flex-col xl:flex-row xl:justify-center'>
                                        <div className='w-full xl:w-auto'><p className='font-medium'>Pk Inicial: {l.pkInicial}</p></div>
                                        <div className='w-full xl:w-auto'><p className='font-medium'>Pk Final: {l.pkFinal}</p></div>
                                    </div>
                                    <div className='w-full flex flex-col items-start justify-center xl:col-span-3'>
                                        <div className='flex gap-2 items-center'>
                                            <p className='text-sky-600 font-medium'>Lote:</p>
                                            <p className='font-medium text-sky-600'>{l.nombre}</p>
                                        </div>
                                        <div className='flex gap-2 mt-1'>
                                            <p className='text-sky-600 font-medium'>Ppi:</p>
                                            <p className='font-medium text-sky-600'>{l.ppiNombre}</p>
                                        </div>
                                    </div>
                                    <div className='w-full xl:col-span-2'>
                                    {
                                            l.totalSubactividades > 0 ? (
                                                <div className='text-start flex flex-col items-start gap-3'>
                                                     {`${l.actividadesAptas || 0}/${l.totalSubactividades} `}
                                                    ({((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%)
                                                    <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '100%' }}>
                                                        <div
                                                            style={{
                                                                background: '#d97706',
                                                                height: '100%',
                                                                borderRadius: '8px',
                                                                width: `${((l.actividadesAptas || 0) / l.totalSubactividades * 100).toFixed(2)}%`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : "Inspección no iniciada"
                                        }
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Elemento;
