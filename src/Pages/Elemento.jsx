import React from 'react'
import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';

function Elemento() {
    const nombre_proyecto = localStorage.getItem('nombre_proyecto')
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
                        <div className='grid grid-cols-9 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
                            <div className='text-left font-medium text-gray-600 sm:block hidden'>Sector</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Sub sector</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Codigo elemento</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Parte</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Elemento</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Lote</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>pk inicial</div>
                            <div className='text-left font-medium text-gray-600 sm:block hidden '>Pk final</div>
                        </div>

                        <Link to={'/tablaPpi'}>
                            <div className='grid grid-cols-9 cursor-pointer items-center justify-start sm:p-5 border-b-2 font-normal text-gray-600'>
                                <div className='flex items-center '>
                                Estructuras
                                </div>

                                <div className='h-10 flex items-center sm:justify-start'>
                                Viaducto de kortazar
                                </div>

                                <div className='flex items-center'>
                             	V101
                                </div>

                                <div className='flex items-center'>
                             	Pilar 1
                                </div>

                                <div className='flex items-center'>
                             	Cimentación
                                </div>

                                <div className='flex items-center'>
                             	Excavación
                                </div>

                                <div className='flex items-center'>
                             	101+120.22
                                </div>
                                <div className='flex items-center'>
                             	101+120.22
                                </div>



                            </div>
                        </Link>

                    </div>

                </div>





            </div>

        </div>
    )
}

export default Elemento