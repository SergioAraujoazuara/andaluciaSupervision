import React, { useEffect, useState } from 'react'
import { db } from '../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';

function Elemento() {

    const [lotes, setLotes] = useState([]);
    const [ppiNombre, setPpiNombre] = useState([]);


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
            console.log(lotesData[0].actividadesAptas)
            console.log(lotesData[0].totalSubactividades)
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
        localStorage.setItem('ppi', l.ppiNombre || '')
        localStorage.setItem('pkInicial', l.pkInicial || '')
        localStorage.setItem('pkFinal', l.pkFinal || '')
    }



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


                    <div className='px-4 py-2 bg-sky-500 text-white rounded-lg '>
                        <Link to={'/bim'}>
                        <button>Visor BIM</button>
                        </Link>
                        
                    </div>

                    <div class="w-full rounded rounded-xl">
                        <div className='grid sm:grid-cols-6 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-200 rounded rounded-md '>
                            <div className='text-left font-medium text-gray-600 sm:block hidden'>Sector</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Sub Sector</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Parte</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Elemento</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Lote y ppi</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden '>Progreso inspección</div>
                        </div>



                        {lotes.map((l, i) => (
                            <Link to={`/tablaPpi/${l.id}/${l.ppiNombre}`} onClick={() => handleCaptrurarTrazabilidad(l)}>
                                <div key={i} className='cursor-pointer grid sm:grid-cols-6 grid-cols-1 items-center justify-start sm:p-5 border-b-2 font-normal text-gray-600 hover:bg-gray-100'>
                                    <div className='sm:border-r-2 sm:border-b-0 flex items-center '>
                                        {l.sectorNombre}
                                    </div>

                                    <div className='sm:border-r-2 sm:border-b-0 flex items-center  sm:ps-10'>
                                        {l.subSectorNombre}
                                    </div>

                                    <div className='sm:border-r-2 h-10 flex items-center sm:justify-start  sm:ps-10'>
                                        {l.parteNombre}
                                    </div>

                                    <div className=' sm:border-r-2 h-10 flex items-center sm:justify-start  sm:ps-10'>
                                        {l.elementoNombre}
                                    </div>


                                    <div className='h-10 flex flex-col items-start sm:justify-center sm:ps-10'>
                                        <p className='font-medium'>Lote: {l.nombre}</p>
                                        <p className='text-sky-600 font-medium'>Ppi: {l.ppiNombre}</p>
                                    </div>

                                    <div className=' h-10 flex items-center sm:justify-start gap-5  sm:ps-10'>
                                        {l.actividadesAptas || '0'}/{l.totalSubactividades || '0'}
                                        {l.totalSubactividades ? ` (${((l.actividadesAptas / l.totalSubactividades) * 100).toFixed(2)}%)` : ''}
                                        <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '20px', width: '40%' }}>
                                            <div
                                                style={{
                                                    background: '#0284c7',
                                                    height: '100%',
                                                    borderRadius: '8px',
                                                    width: `${l.totalSubactividades ? ((l.actividadesAptas / l.totalSubactividades) * 100) : 0}%`
                                                }}
                                            />
                                        </div>

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
