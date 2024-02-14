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
                        <div className='grid sm:grid-cols-10 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
                            <div className='text-left font-medium text-gray-600 sm:block hidden sm:col-span-2'>Capítulo</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-4'>Elemento</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-4'>PPI</div>
                        </div>

                        <Link to={'/tablaPpi'}>
                            <div className='cursor-pointer grid sm:grid-cols-10 grid-cols-1 items-center justify-start sm:p-5 border-b-2 font-normal text-gray-600'>
                                <div className='sm:border-r-2 sm:border-b-0 flex items-center sm:col-span-2'>
                                Viaducto de Kortazar	
                                </div>

                                 <div className='sm:border-r-2 sm:border-b-0 flex items-center sm:col-span-3 sm:ps-10'>
                             	Zapata
                                </div>

                                <div className='h-10 flex items-center sm:justify-start sm:col-span-5 sm:ps-10'>
                                0302 Elementos estructurales de hormigón
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