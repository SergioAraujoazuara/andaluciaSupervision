import React from 'react'
import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';

function Ppi() {
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
                    <h1 className='font-medium text-amber-600'>Punto de inspección (PPI)</h1>
                </Link>

               
            </div>

            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                    <div className='flex gap-2 items-center'>

                    <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-lg shadow-md' style={{ marginLeft: 'auto' }}>{nombre_proyecto}</button>
                    </div>

                    <div className='border-t-2 w-full p-0 m-0'></div>




                    <div class="w-full rounded rounded-xl  mt-5">
                        <div className='grid sm:grid-cols-8 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
                            <div className='text-left font-medium text-gray-600 sm:block hidden'>Número</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-3'>Nombre</div>
                            <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-3'>Información</div>
                        </div>

                        <Link to={'/tablaPpi'}>
                            <div className='cursor-pointer grid sm:grid-cols-8 grid-cols-1 items-center justify-start sm:p-5 border-b-2'>
                                <div className='sm:border-r-2 sm:border-b-0 flex items-center'>
                                0302		
                                </div>

                                 <div className='sm:border-r-2 sm:border-b-0 flex items-center sm:col-span-3 sm:ps-10'>
                             Elementos estructurales de hormigón	
                                </div>

                                <div className='h-10 flex items-center sm:justify-start font-medium text-gray-600 sm:col-span-3 sm:ps-10'>
                                    Información sobre elemento 1
                                </div>



                            </div>
                        </Link>

                    </div>

                </div>





            </div>

        </div>
    )
}

export default Ppi