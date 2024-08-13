import React, { useEffect, useState } from 'react'
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, deleteDoc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";
import { IoAlertCircleSharp } from "react-icons/io5";

import { IoMdAddCircleOutline } from "react-icons/io";

function VerPpis() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/admin'); // Esto navega hacia atrás en la historia
    };
    const [ppis, setPpis] = useState([]);
    const [selectedPpi, setSelectedPpi] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [ppiIdAEliminar, setPpiIdAEliminar] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // Nuevo estado para el mensaje de error
    const [showModalEliminar, setShowModalEliminar] = useState(false);



    // Función para cargar los PPIs
    const cargarPpis = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "ppis"));
            const ppisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPpis(ppisList);
        } catch (error) {
            console.error("Error al cargar los PPIs:", error);
        }
    };

    // Llamar a cargarPpis en useEffect para cargar los PPIs al montar el componente
    useEffect(() => {
        cargarPpis();
    }, []);

    // Eliminar ppi
    const eliminarPpiConfirmado = async () => {
        if (ppiIdAEliminar) {
            try {
                await deleteDoc(doc(db, "ppis", ppiIdAEliminar));
                const updatedPpis = ppis.filter(ppi => ppi.id !== ppiIdAEliminar);
                setPpis(updatedPpis); // Actualiza el estado localmente.
                setShowModal(false); // Cierra el modal.
                setShowModalEliminar(true);
                setTimeout(() => {
                    setShowModalEliminar(false);
                }, 2500); // 5000 milisegundos = 5 segundos

                setErrorMessage("PPI eliminado exitosamente.");
            } catch (error) {
                console.error("Error al eliminar el PPI:", error);
                setErrorMessage("Hubo un problema al intentar eliminar el PPI"); // Establece el mensaje de error
            }
        }
    };

    const mostrarModalEliminar = (idPpi) => {
        setPpiIdAEliminar(idPpi);
        setShowModal(true);
        setErrorMessage(""); // Reinicia el mensaje de error cuando se muestra el modal
    };

    const handleCloseAlert = () => {
        setShowModal(false);
        setErrorMessage(""); // Reinicia el mensaje de error al cerrar el modal
    };



    return (
        <div className='container mx-auto min-h-screen xl:px-14 py-2 text-gray-500'>
            <div className='flex gap-2 items-center justify-between px-4 py-3 text-base'>

                <div className='flex gap-2 items-center'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'/admin'}>
                        <h1 className='text-gray-500 text-gray-500'>Administración</h1>
                    </Link>
                    <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                    <Link to={'/verPpis'}>
                        <h1 className='text-amber-500 font-medium'>Plantillas PPI</h1>
                    </Link>
                </div>



                <div className='flex items-center'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>

            </div>

            <div className='w-full border-b-2 border-gray-200'></div>



            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white px-5 '>

                    <div>

                        <p className='flex xl:flex-row flex-col text-sm gap-2 underline'>
                            <span className='flex items-center gap-2'><IoAlertCircleSharp className='text-yellow-500 text-xl' />Atencion! </span>
                            Al editar el PPI, los cambios no se actualizarán en las inspecciones ya realizadas. Si se modifica un PPI con una inspección en curso,
                            deberás realizar la inspección completa nuevamente.
                        </p>
                    </div>


                    <div class="w-full rounded rounded-t-xl">




                        <div className="overflow-x-auto relative">
                            <div className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                {/* Header */}
                                <div className="hidden sm:block bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400 rounded-t-lg">
                                    <div className="grid grid-cols-12 py-3 px-4 font-medium">
                                        <div className="col-span-1">Versión</div>
                                        <div className="col-span-10">Nombre PPI</div>
                                        <div className="col-span-1 text-center">Acciones</div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div>
                                    {ppis
                                        .sort((a, b) => {
                                            // Comparar nombres alfabéticamente
                                            if (a.nombre.toLowerCase() < b.nombre.toLowerCase()) return -1;
                                            if (a.nombre.toLowerCase() > b.nombre.toLowerCase()) return 1;

                                            // Si los nombres son iguales, comparar las versiones (de menor a mayor)
                                            return a.version - b.version;
                                        })
                                        .map((p, index) => (
                                            <div key={index} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 sm:bg-white sm:dark:bg-gray-800">
                                                <div className="sm:hidden bg-white dark:bg-gray-800 p-4 mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-lg font-bold text-gray-900 dark:text-white">V-{p.version}</p>
                                                        <button className='text-xl text-amber-700' onClick={() => mostrarModalEliminar(p.id)}>
                                                            <MdDeleteOutline />
                                                        </button>
                                                    </div>
                                                    <Link to={`/editarPpi/${p.id}`} className="text-sm text-gray-700 dark:text-gray-400">
                                                        {p.nombre}
                                                    </Link>
                                                </div>

                                                <div className="hidden sm:grid grid-cols-12 px-4 py-3">
                                                    <div className="col-span-1">V-{p.version}</div>
                                                    <Link to={`/editarPpi/${p.id}`} className='col-span-10'>
                                                        <div className='flex gap-4'>
                                                            <p>{p.nombre}</p>
                                                        </div>
                                                    </Link>
                                                    <div className="col-span-1 text-center">
                                                        <button className='text-xl text-amber-700' onClick={() => mostrarModalEliminar(p.id)}>
                                                            <MdDeleteOutline />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                            </div>
                        </div>




                    </div>
                    <div className='flex gap-2 mt-2 xl:block hidden'>
                        <p className=' px-4 py-2 rounded-lg'> Crear nuevo ppi: </p>
                        <Link to={'/agregarPpi'}>

                            <button className='bg-sky-600 flex gap-1 items-center text-white px-4 py-2 rounded-lg'> <IoMdAddCircleOutline /> Agregar</button>
                        </Link>
                    </div>
                </div>





            </div>
            {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-amber-200 sm:mx-0 sm:h-10 sm:w-10">
                                        {/* Icono de advertencia o eliminación */}
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Confirmación de eliminación
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                ¿Estás seguro de que deseas eliminar este PPI? Esta acción no se puede deshacer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">

                                <button onClick={handleCloseAlert} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                    Cancelar
                                </button>
                                <button onClick={() => eliminarPpiConfirmado()} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 sm:ml-3 sm:w-auto sm:text-sm">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showModalEliminar && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                        {/* Icono de éxito */}
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg font-medium text-gray-900" id="modal-headline">
                                            Éxito
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                El PPI ha sido eliminado exitosamente.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="button" onClick={() => setShowModalEliminar(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}




        </div>
    )
}

export default VerPpis