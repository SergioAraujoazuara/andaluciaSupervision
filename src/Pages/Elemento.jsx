import React, { useEffect, useState } from 'react'
import { db } from '../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';

function Elemento() {

    const [lotes, setLotes] = useState([]);

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
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    };



    return (
        <div className='min-h-screen px-14 py-5'>

            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className=' text-gray-500'>Inicio</h1>
                </Link>

                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Elementos</h1>
                </Link>


            </div>

            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>




                    <div class="w-full rounded rounded-xl">
                        <div className='grid sm:grid-cols-5 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-200 rounded rounded-md '>
                            <div className='text-left font-medium text-gray-600 sm:block hidden'>Sector</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Sub Sector</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Parte</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Elemento</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Lote y ppi</div>
                        </div>



                        {lotes.map((l, i) => (
                            <Link to={`/tablaPpi/${l.ppiNombre}`}>
                                <div className='cursor-pointer grid sm:grid-cols-5 grid-cols-1 items-center justify-start sm:p-5 border-b-2 font-normal text-gray-600 hover:bg-gray-100'>
                                    <div className='sm:border-r-2 sm:border-b-0 flex items-center '>
                                        {l.sectorNombre}
                                    </div>

                                    <div className='sm:border-r-2 sm:border-b-0 flex items-center  sm:ps-10'>
                                        {l.subSectorNombre}
                                    </div>

                                    <div className='h-10 flex items-center sm:justify-start  sm:ps-10'>
                                        {l.parteNombre}
                                    </div>

                                    <div className='h-10 flex items-center sm:justify-start  sm:ps-10'>
                                        {l.elementoNombre}
                                    </div>


                                    <div className='h-10 flex flex-col items-start sm:justify-center sm:ps-10'>
                                        <p className='font-medium'>Lote: {l.nombre}</p>
                                        <p className='text-sky-600 font-medium'>Ppi: {l.ppiNombre}</p>
                                    </div>


                                </div>
                            </Link>
                        ))}



                    </div>

                </div>





            </div>

        </div>
    )
}

export default Elemento
