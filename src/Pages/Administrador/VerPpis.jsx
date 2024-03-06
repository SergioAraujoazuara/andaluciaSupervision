import React, { useEffect, useState } from 'react'
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";

import { IoCreateOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";

function VerPpis() {

    const [ppis, setPpis] = useState([]);
    const [selectedPpi, setSelectedPpi] = useState("");

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
    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>

            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-ligth text-gray-500'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Administración</h1>
                </Link>

            </div>


            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>




                    <div class="w-full rounded rounded-xl">

                        <div>
                            <Link to={'/agregarPpi'}>
                            <button className='bg-sky-600 flex gap-1 items-center text-white px-4 py-2 rounded-lg'> <IoMdAddCircleOutline/> Agregar ppi</button>
                            </Link>
                        </div>


                        <div className="overflow-x-auto relative shadow-md sm:rounded-lg mt-5">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400 bg-gray-100">
                                    <tr>
                                        <th scope="col" className="py-3 px-6">
                                            Ppi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ppis.map((p, index) => (
                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="py-4 px-6">
                                                {p.nombre}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>



                    </div>

                </div>





            </div>

        </div>
    )
}

export default VerPpis