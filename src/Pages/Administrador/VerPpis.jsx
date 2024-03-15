import React, { useEffect, useState } from 'react'
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, deleteDoc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";


import { IoMdAddCircleOutline } from "react-icons/io";

function VerPpis() {

    const [ppis, setPpis] = useState([]);
    const [selectedPpi, setSelectedPpi] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [ppiIdAEliminar, setPpiIdAEliminar] = useState(null);


    // Función para cargar los PPIs
    const cargarPpis = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "ppis"));
            const ppisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPpis(ppisList);
            console.log(ppisList);
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
                alert("PPI eliminado exitosamente.");
            } catch (error) {
                console.error("Error al eliminar el PPI:", error);
                alert("Hubo un problema al intentar eliminar el PPI.");
            }
        }
    };

    const mostrarModalEliminar = (idPpi) => {
        setPpiIdAEliminar(idPpi);
        setShowModal(true);
    };

    const handleCloseAlert = () => {
        setShowModal(false)

    }


    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>



            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/admin'}>
                    <h1 className='text-gray-500 text-gray-500'>Administración</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/verPpis'}>
                    <h1 className='text-amber-500 font-medium'>Ver Ppis</h1>
                </Link>


            </div>


            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>




                    <div class="w-full rounded rounded-xl">

                        <div>
                            <Link to={'/agregarPpi'}>
                                <button className='bg-sky-600 flex gap-1 items-center text-white px-4 py-2 rounded-lg'> <IoMdAddCircleOutline /> Agregar ppi</button>
                            </Link>
                        </div>


                        <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-5">
                            <div className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <div className="text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-400 bg-gray-200">
                                    <div>
                                        <div scope="col" className="py-3 px-4 font-medium">
                                            Nombre Ppi
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {ppis.map((p, index) => (

                                        <div key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">



                                            <div className='grid grid-cols-12 px-4 py-3'>
                                                <Link to={`/editarPpi/${p.id}`} className='col-span-11'>
                                                    <p >{p.nombre}</p>
                                                </Link>


                                                <button className='text-xl col-span-1 text-red-700' onClick={() => mostrarModalEliminar(p.id)}><MdDeleteOutline /></button>




                                            </div>



                                        </div>

                                    ))}
                                </div>
                            </div>
                        </div>



                    </div>

                </div>





            </div>
            {showModal && (
                <>
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500 mb-4"><IoCloseCircle /></button>

                            <p className='text-gray-500 font-medium'>¿Estás seguro de que deseas eliminar este PPI?</p>

                            <div className='flex gap-3 justify-center mt-4'>
                            <button className='text-sm bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg shadow-md' onClick={() => eliminarPpiConfirmado()}>Eliminar</button>
                            <button className='text-sm bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-md' onClick={handleCloseAlert}>Cancelar</button>
                            </div>
                            

                        </div>
                    </div>

                </>
            )}



        </div>
    )
}

export default VerPpis