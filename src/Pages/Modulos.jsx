import React from 'react'
import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { BsClipboardCheck } from "react-icons/bs";

import { Link } from 'react-router-dom';

function Modulos() {
    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>

            <div className='flex gap-2 items-center justify start bg-white px-5 py-4 rounded rounded-xl shadow-md text-sm'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-ligth text-gray-500'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='font-medium text-amber-600'>Módulos</h1>
                </Link>
            </div>


            <div>
            <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                    <div className='flex gap-2 items-center'>

                        <h1 className='font-bold text-xl text-gray-500  px-5 '>Módulos</h1>
                    </div>

                    <div className='border-t-2 w-full p-0 m-0'></div>




                    <div class="w-full rounded rounded-xl  mt-5">


                        <div className='cursor-pointer flex gap-5 items-center justify-start p-5
     '>

                            <Link to={'/elementos'}>
                                <div className='flex gap-3'>
                                <div className='h-10 flex items-center text-gray-600'>
                                    <BsClipboardCheck style={{ width: 40, height: 40 }} />
                                </div>
                                <div className='sm:col-span-9 h-10 flex items-center sm:justify-start text-base font-medium'>
                                    Inspección
                                </div>
                                </div>
                                
                            </Link>


                        </div>


                    </div>

                </div>





            </div>

        </div>
    )
}

export default Modulos