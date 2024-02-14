import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { db } from '../../../firebase_config';
import { collection, getDocs, setDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import AlertaEditarProyecto from './AlertaEditarProyecto';


function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate()

    const [proyecto, setProyecto] = useState(null);

    const [alertMessage, setAlertMessage] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const closeAlert = () => {
        setIsAlertOpen(false);
    };


    useEffect(() => {
        const obtenerProyectos = async () => {
            try {
                const proyectosCollection = collection(db, 'proyectos');
                const proyectosSnapshot = await getDocs(proyectosCollection);

                const proyectosData = proyectosSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setProyecto(proyectosData.find((p) => p.id === id));

            } catch (error) {
                console.error('Error al obtener la lista de proyectos:', error);
            }
        };

        obtenerProyectos();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProyecto({
            ...proyecto,
            [name]: value,
        });
    };

    const actualizarProyecto = async () => {
        try {
            const proyectoRef = doc(db, 'proyectos', id);
            const batch = writeBatch(db);

            // Actualizar el proyecto con el nuevo nombre corto
            batch.update(proyectoRef, { nombre_corto: proyecto.nombre_corto });

            // Ejecutar actualización por cada campo individual excepto nombre_corto
            const camposAActualizar = { ...proyecto };
            delete camposAActualizar.nombre_corto; // Eliminar el campo nombre_corto
            for (const campo in camposAActualizar) {
                batch.update(proyectoRef, { [campo]: camposAActualizar[campo] });
            }

            // Obtener todos los registros que tengan el nombre del proyecto anterior
            const registrosQuery = query(collection(db, 'registros'), where('idProyecto', '==', proyecto.id));
            const registrosSnapshot = await getDocs(registrosQuery);

            // Actualizar el campo proyecto en los registros encontrados
            registrosSnapshot.forEach((registroDoc) => {
                const registroRef = doc(db, 'registros', registroDoc.id);
                batch.update(registroRef, { proyecto: proyecto.nombre_corto });
            });

            // Ejecutar el lote de escritura para aplicar todas las actualizaciones
            await batch.commit();

            setAlertMessage('Actualizado correctamente');
            setIsAlertOpen(true);
        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            setAlertMessage('Error al actualizar el proyecto');
            setIsAlertOpen(true);
        }
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
                    <h1 className='font-medium text-amber-600'>Editar </h1>

                </Link>

            </div>



            <div className="bg-white mx-auto mt-5 grid sm:grid-cols-3 grid-cols-1 gap-8 bg-gray-100 p-8 shadow-xl rounded-lg text-base">
                {proyecto && (
                    <>

                        {/* Imagen */}
                        <div className='flex justify-start'>
                            <img className='rounded-md w-40' src={proyecto.logo} alt="logo" />
                        </div>

                        {/* Nombre corto y Código TPF */}
                        <div>


                            <label className='font-bold'>Nombre corto:
                                <input
                                    type="text"
                                    name="nombre_corto"
                                    value={proyecto.nombre_corto}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800 mt-2'
                                />
                            </label>
                        </div>

                        <div>


                            <label className='font-bold'>Código TPF:
                                <input
                                    type="text"
                                    name="codigoTpf"
                                    value={proyecto.codigoTpf}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800 mt-2'
                                />
                            </label>
                        </div>



                        <div >
                            <label className='font-bold'>Nombre completo:
                                <input
                                    type="text"
                                    name="nombre_completo"
                                    value={proyecto.nombre_completo}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800 mt-2'
                                />
                            </label>
                        </div>

                        {/* Resto de los inputs en dos columnas */}
                        <div>



                            <label className='font-bold'>Importe de obra:
                                <input
                                    type="text"
                                    name="importe_obra"
                                    value={proyecto.importe_obra}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800 mt-2'
                                />
                            </label>

                        </div>

                        <div>


                            <label className='font-bold'>Importe TPF:
                                <input
                                    type="text"
                                    name="importe_tpf"
                                    value={proyecto.importe_tpf}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800'
                                />
                            </label>

                        </div>

                        <div>


                            <label className='font-bold'>Cliente:
                                <input
                                    type="text"
                                    name="cliente"
                                    value={proyecto.cliente}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800 mt-2'
                                />
                            </label>

                        </div>

                        <div>
                            <label className='font-bold'>Contratista:
                                <input
                                    type="text"
                                    name="contratista"
                                    value={proyecto.contratista}
                                    onChange={handleInputChange}
                                    className='border font-normal p-2 rounded-md w-full focus:outline-none focus:border-amber-800'
                                />
                            </label>


                        </div>

                        <div className='col-span-2'>
                            {/* Botón de actualización */}
                            <button
                                type="button"
                                onClick={actualizarProyecto}
                                className='mt-8 bg-sky-600 text-white font-bold py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring focus:border-sky-800'
                            >
                                Actualizar Proyecto
                            </button>
                        </div>



                        {isAlertOpen && (
                            <AlertaEditarProyecto
                                message={alertMessage}
                                closeModal={closeAlert}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default EditProject