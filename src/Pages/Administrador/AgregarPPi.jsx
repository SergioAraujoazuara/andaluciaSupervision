import React, { useEffect, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase_config';
import { GoHomeFill } from "react-icons/go";
import { Link, useParams } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";

function PlantillaPpi() {
    const { ppiNombre } = useParams();
    const [ppi, setPpi] = useState(null); // Estado para almacenar los datos del PPI

    useEffect(() => {
        const obtenerPpi = async () => {
            try {
                const q = query(collection(db, "ppis"), where("nombre", "==", ppiNombre));
                const querySnapshot = await getDocs(q);
                const ppiData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (ppiData.length > 0) {
                    console.log(ppiData[0]); // Asume que solo hay un PPI con ese nombre y toma el primero
                    setPpi(ppiData[0]); // Asume que solo hay un PPI con ese nombre y toma el primero
                } else {
                    console.log('No se encontró el PPI con el nombre:', ppiNombre);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener el PPI:', error);
            }
        };

        if (ppiNombre) {
            obtenerPpi();
        }
    }, [ppiNombre]); // Este efecto se ejecutará cada vez que ppiNombre cambie

    const [nombre, setNombre] = useState('');
    const [actividades, setActividades] = useState([
        {
            numero: '',
            actividad: '',
            subactividades: [
                {
                    numero: '',
                    nombre: '',
                    criterio_aceptacion: '',
                    documentacion_referencia: '',
                    tipo_inspeccion: '',
                    punto: '',
                    responsable: '',
                    fecha: '',
                    firma: ''
                }
            ]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleActividadChange = (index, e) => {
        const newActividades = [...actividades];
        newActividades[index][e.target.name] = e.target.value;
        setActividades(newActividades);
    };

    const handleSubactividadChange = (actividadIndex, subactividadIndex, e) => {
        const newActividades = [...actividades];
        newActividades[actividadIndex].subactividades[subactividadIndex][e.target.name] = e.target.value;
        setActividades(newActividades);
    };

    const addSubactividad = (actividadIndex) => {
        const newActividades = [...actividades];
        newActividades[actividadIndex].subactividades.push({
            numero: '',
            nombre: '',
            criterio_aceptacion: '',
            documentacion_referencia: '',
            tipo_inspeccion: '',
            punto: '',
            responsable: '',
            fecha: '',
            firma: ''
        });
        setActividades(newActividades);
    };

    const handleAgregarPPi = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'ppis'), {
                nombre,
                actividades
            });

            setNombre('');
            setActividades([
                {
                    numero: '',
                    actividad: '',
                    subactividades: [
                        {
                            numero: '',
                            nombre: '',
                            criterio_aceptacion: '',
                            documentacion_referencia: '',
                            tipo_inspeccion: '',
                            punto: '',
                            responsable: '',
                            fecha: '',
                            firma: ''
                        }
                    ]
                }
            ]);
            alert('El PPI se agregó correctamente.');
        } catch (err) {
            console.error('Error al agregar el PPI:', err);
            setError('Hubo un error al agregar el PPI. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    // Función para agregar una nueva actividad
    const addActividad = () => {
        const newActividad = {
            numero: '',
            actividad: '',
            subactividades: [
                {
                    numero: '',
                    nombre: '',
                    criterio_aceptacion: '',
                    documentacion_referencia: '',
                    tipo_inspeccion: '',
                    punto: '',
                    responsable: '',
                    fecha: '',
                    firma: ''
                }
            ]
        };
        setActividades([...actividades, newActividad]);
    };

    return (
        <>

            <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

                {/* Navigation section */}
                <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'/admin'}>
                        <h1 className='text-gray-500 text-gray-500'>Administración</h1>
                    </Link>
                    <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                    <Link to={'/verPpis'}>
                        <h1 className='text-gray-500 text-gray-500'>Ver Ppis</h1>
                    </Link>
                    <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Crear PPI</h1>
                    </Link>

                </div>


                <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>




                    <form onSubmit={handleAgregarPPi}>
                        <div className="mb-4">

                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre punto inspección (PPI):</label>
                            <input
                                type="text"
                                id="nombre"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                required
                                className="p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <button type="button" onClick={addActividad} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                Añadir Actividad
                            </button>
                        </div>
                        
                        <div className='w-full bg-gray-200 grid grid-cols-6 text-sm'>
                            <div className="py-3 px-2 text-left">Nº</div>
                            <div className="py-3 px-2 text-left whitespace-normal ">Actividad</div>
                            <div className="py-3 px-2 text-left whitespace-normal ">Criterio de aceptación</div>
                            <div className="py-3 px-2 text-left whitespace-normal ">Documentación de referencia</div>
                            <div className="py-3 px-2 text-left">Tipo de inspección</div>
                            <div className="py-3 px-2 text-left">Punto</div>



                        </div>



                        <div>
                            {actividades.map((actividad, i) => (
                                <div key={i} className="border rounded-md">
                                    <div className='bg-gray-100 grid grid-cols-6'>
                                        <input
                                            name="numero"
                                            placeholder="Número"
                                            value={actividad.numero}
                                            onChange={e => handleActividadChange(i, e)}
                                            required
                                            className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                                        />
                                        <input
                                            name="actividad"
                                            placeholder="Nombre"
                                            value={actividad.actividad}
                                            onChange={e => handleActividadChange(i, e)}
                                            required
                                            className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100"
                                        />
                                    </div>


                                    {actividad.subactividades && actividad.subactividades.map((sub, j) => (
                                        <div key={j} className="w-full grid grid-cols-6">
                                            <input
                                                name="numero"
                                                placeholder="Número de subactividad"
                                                value={sub.numero}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                name="nombre"
                                                placeholder="Descripción"
                                                value={sub.nombre}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                name="criterio_aceptacion"
                                                placeholder="Criterio de aceptación"
                                                value={sub.criterio_aceptacion}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                name="documentacion_referencia"
                                                placeholder="Documentación de referencia"
                                                value={sub.documentacion_referencia}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                name="tipo_inspeccion"
                                                placeholder="Tipo de inspección"
                                                value={sub.tipo_inspeccion}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                            <input
                                                name="punto"
                                                placeholder="Punto"
                                                value={sub.punto}
                                                onChange={e => handleSubactividadChange(i, j, e)}
                                                required
                                                className="p-2 block w-full border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />

                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addSubactividad(i)} className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Añadir Subactividad
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className='flex gap-5'>
                            <button type="submit" disabled={loading} className="w-1/6 mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                {loading ? 'Cargando...' : 'Agregar PPI'}
                            </button>

                           
                        </div>

                        {error && <p className="mt-4 text-red-500">{error}</p>}
                    </form>
                </div>

            </div>



        </>

    );
}

export default PlantillaPpi;
