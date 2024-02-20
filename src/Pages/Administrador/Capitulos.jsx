import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, doc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { IoMdAddCircle } from "react-icons/io";
import { FaRegEyeSlash } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";
import { TbBuildingFactory } from "react-icons/tb";
import { FaCubes } from "react-icons/fa";
import { MdOutlineShareLocation } from "react-icons/md";

function Capitulos() {
    const { id } = useParams();
    const [proyecto, setProyecto] = useState({});
    const [nuevoCapitulo, setNuevoCapitulo] = useState('');
    const [elemento, setElemento] = useState('');
    const [ppi, setPpi] = useState('');
    const [trazabilidadVisible, setTrazabilidadVisible] = useState(false);
    const [sector, setSector] = useState('');
    const [subSector, setSubSector] = useState('');
    const [parte, setParte] = useState('');
    const [lote, setLote] = useState('');
    const [pkInicial, setPkInicial] = useState('');
    const [pkFinal, setPkFinal] = useState('');
    const [capitulos, setCapitulos] = useState([]);
    const [ppisExistente, setPpisExistente] = useState([]);
    const [ppiSeleccionado, setPpiSeleccionado] = useState('');

    // Obtener proyecto
    const obtenerProyecto = async () => {
        try {
            const proyectoRef = doc(db, 'proyectos', id);
            const proyectoSnapshot = await getDoc(proyectoRef);

            if (proyectoSnapshot.exists()) {
                setProyecto({ id: proyectoSnapshot.id, ...proyectoSnapshot.data() });
            } else {
                console.log('No se encontró ningún proyecto con el ID:', id);
            }
        } catch (error) {
            console.error('Error al obtener el proyecto:', error);
        }
    };

    useEffect(() => {
        obtenerProyecto();
    }, []);

    // Actualizar PPIs existentes y establecer la visibilidad del botón de trazabilidad
    useEffect(() => {
        const ppiList = capitulos.flatMap(capitulo => capitulo.ppis);
        setPpisExistente(ppiList);
        setTrazabilidadVisible(!!ppiSeleccionado); // Mostrar botón solo cuando se selecciona un PPI
    }, [capitulos, ppiSeleccionado]);

    // Resto del código ...


    // Función para agregar un nuevo capítulo
    const agregarCapitulo = () => {
        setCapitulos([...capitulos, { capitulo: nuevoCapitulo, elementos: [], ppis: [] }]);
        setNuevoCapitulo('');
    };

    // Función para agregar un elemento a un capítulo
    const agregarElemento = () => {
        const updatedCapitulos = capitulos.map((item) => {
            if (item.capitulo === nuevoCapitulo) {
                return { ...item, elementos: [...item.elementos, elemento] };
            }
            return item;
        });
        setCapitulos(updatedCapitulos);
        setElemento('');
    };

    // Función para agregar un PPI a un capítulo
    const agregarPpi = () => {
        const updatedCapitulos = capitulos.map((item) => {
            if (item.capitulo === nuevoCapitulo) {
                return { ...item, ppis: [...item.ppis, { ppi, sector, subSector, parte, lote, pkInicial, pkFinal }] };
            }
            return item;
        });
        setCapitulos(updatedCapitulos);
        setPpi('');
        setSector('');
        setSubSector('');
        setParte('');
        setLote('');
        setPkInicial('');
        setPkFinal('');
    };

    // Función para mostrar u ocultar los campos de trazabilidad
    const toggleTrazabilidad = () => {
        setTrazabilidadVisible(!trazabilidadVisible);
    };

    // Función para agregar los campos de trazabilidad al PPI seleccionado
    const agregarTrazabilidad = () => {
        const updatedCapitulos = capitulos.map((item) => {
            if (item.capitulo === nuevoCapitulo) {
                const updatedPpis = item.ppis.map(ppiItem => {
                    if (ppiItem.ppi === ppiSeleccionado) {
                        return { ...ppiItem, sector, subSector, parte, lote, pkInicial, pkFinal };
                    }
                    return ppiItem;
                });
                return { ...item, ppis: updatedPpis };
            }
            return item;
        });
        setCapitulos(updatedCapitulos);
    };

    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>

            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-ligth text-gray-500'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/admin'}>
                    <h1 className='text-gray-600'>Administración</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/viewProject'}>
                    <h1 className=' text-gray-600'>Ver proyectos</h1>

                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Capitulos, Ppi y Trazabilidad </h1>

                </Link>

            </div>

            <div className='flex gap-3 flex-col mt-5 bg-white p-8 rounded rounded-xl shadow-md'>
                <div className='flex gap-5'>
                    <img src={proyecto.logo} alt="logo" className='sm:w-52' />
                    <div className='text-lg font-medium text-gray-500'>
                        <p>{proyecto.nombre_corto}</p>
                        <p>{proyecto.nombre_completo}</p>
                    </div>
                </div>

                <div className='w-full border border-b-2'></div>

                <div className="mt-4 ">
                    <p className='text-lg font-medium text-gray-500 mb-3 flex items-center gap-2'><TbBuildingFactory/> Sector</p>


                    <div className="flex items-center gap-3">
                        <label htmlFor="capitulo">Sector: </label>
                        <input type="text" className='border px-3 py-1 rounded-lg' value={nuevoCapitulo} onChange={(e) => setNuevoCapitulo(e.target.value)} />
                        <button onClick={agregarCapitulo} className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                            <IoMdAddCircle />
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <p className='text-lg font-medium text-gray-500 mb-3 flex items-center gap-2'><FaCubes/> Sub sector</p>

                    <div className="flex items-center gap-3">
                        <label htmlFor="capituloSeleccionado">Selecciona un sector:</label>
                        <select id="capituloSeleccionado" value={nuevoCapitulo} onChange={(e) => setNuevoCapitulo(e.target.value)} className="border">
                            <option value="">Seleccionar</option>
                            {capitulos.map((item, index) => (
                                <option key={index} value={item.capitulo}>{item.capitulo}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="mt-4 flex gap-20">
                    <div className="flex items-center gap-3">
                        <label htmlFor="elemento">Sub sector:</label>
                        <input type="text" id="elemento" value={elemento} onChange={(e) => setElemento(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        <button onClick={agregarElemento} className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                            <IoMdAddCircle />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <label htmlFor="ppi">Parte</label>
                        <input type="text" id="ppi" value={ppi} onChange={(e) => setPpi(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        <button onClick={agregarPpi} className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                            <IoMdAddCircle />
                        </button>
                    </div>
                </div>

                <div className="mt-4">

                    <p className='text-lg font-medium text-gray-500 mb-3 flex items-center gap-2'><MdOutlineShareLocation/>Lote</p>

                    <div className="flex items-center gap-3">
                        <label htmlFor="ppiSeleccionado">Selecciona un PPI:</label>
                        <select id="ppiSeleccionado" value={ppiSeleccionado} onChange={(e) => setPpiSeleccionado(e.target.value)} className="border">
                            <option value="">Seleccionar</option>
                            {ppisExistente.map((item, index) => (
                                <option key={index} value={item.ppi}>{item.ppi}</option>
                            ))}
                        </select>
                        {ppiSeleccionado && (
                            <>
                                <button onClick={toggleTrazabilidad} className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                                    {trazabilidadVisible ? <FaRegEyeSlash /> : <IoMdAddCircle />}
                                </button>
                                {trazabilidadVisible && (
                                    <button onClick={agregarTrazabilidad} className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded">
                                        <IoMdAddCircle />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                </div>


                {trazabilidadVisible && (
                    <div>
                        <div className="mt-4">
                            <label htmlFor="sector">Sector:</label>
                            <input type="text" id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="subSector">Subsector:</label>
                            <input type="text" id="subSector" value={subSector} onChange={(e) => setSubSector(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="parte">Parte:</label>
                            <input type="text" id="parte" value={parte} onChange={(e) => setParte(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="lote">Lote:</label>
                            <input type="text" id="lote" value={lote} onChange={(e) => setLote(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="pkInicial">PK Inicial:</label>
                            <input type="text" id="pkInicial" value={pkInicial} onChange={(e) => setPkInicial(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>

                        <div className="mt-4">
                            <label htmlFor="pkFinal">PK Final:</label>
                            <input type="text" id="pkFinal" value={pkFinal} onChange={(e) => setPkFinal(e.target.value)} className="border px-3 py-1 rounded-lg" />
                        </div>
                    </div>
                )}


                <div className="mt-4">

                    <table className="border-collapse border w-full mt-4 rounded-xl" style={{ borderRadius: 10 }}>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className="px-4 py-2">Sector</th>
                                <th className="border border-gray-200 px-4 py-2">Sub sector</th>
                                <th className="border border-gray-200 px-4 py-2">Parte</th>
                                <th className="border border-gray-200 px-4 py-2">Pk inicial</th>
                                <th className="border border-gray-200 px-4 py-2">Pk Final</th>
                                <th className="border border-gray-200 px-4 py-2">Elemento</th>
                                <th className="border border-gray-200 px-4 py-2">Código elemento</th>
                                <th className="border border-gray-200 px-4 py-2">Lote</th>
                            </tr>
                        </thead>
                        <tbody>
                            {capitulos.map((item, index) => (
                                <tr key={index}>
                                    <td className="border border-gray-200 px-4 py-2">{item.capitulo}</td>
                                    <td className="border border-gray-200 px-4 py-2">
                                        {item.elementos.map((elemento, idx) => (
                                            <div key={idx}>{elemento}</div>
                                        ))}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2">
                                        {item.ppis.map((ppi, idx) => (
                                            <div key={idx}>
                                                <div>PPI: {ppi.ppi}</div>
                                            </div>
                                        ))}
                                    </td>
                                    <td className="border border-gray-200 px-4 py-2">
                                        {item.ppis.map((ppi, idx) => (
                                            <div key={idx}>
                                                {trazabilidadVisible && ppiSeleccionado === ppi.ppi && (
                                                    <div>
                                                        <div>Sector: {ppi.sector}</div>
                                                        <div>Subsector: {ppi.subSector}</div>
                                                        <div>Parte: {ppi.parte}</div>
                                                        <div>Lote: {ppi.lote}</div>
                                                        <div>PK Inicial: {ppi.pkInicial}</div>
                                                        <div>PK Final: {ppi.pkFinal}</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Capitulos;
