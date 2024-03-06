import React from 'react'

import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";

import { IoCreateOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";

import { Link } from 'react-router-dom';



function AdminHome() {
    const proyectoNombre = localStorage.getItem('proyectoNombre')
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


                        <div className='cursor-pointer flex gap-20 items-center justify-start p-5
     '>

                            <Link to={'/crearProyecto'}>
                                <div className='flex gap-3'>
                                <div className='h-10 flex items-center text-gray-600'>
                                    <IoMdAddCircleOutline style={{ width: 40, height: 40 }} />
                                </div>
                                <div className='sm:col-span-9 h-10 flex items-center sm:justify-start text-base font-medium'>
                                    Crear proyecto
                                </div>
                                </div>
                                
                            </Link>

                            <Link to={'/viewProject'}>
                                <div className='flex gap-3'>
                                <div className='h-10 flex items-center text-gray-600'>
                                    <IoCreateOutline style={{ width: 40, height: 40 }} />
                                </div>
                                <div className='sm:col-span-9 h-10 flex items-center sm:justify-start text-base font-medium'>
                                    Ver proyectos
                                </div>
                                </div>
                                
                            </Link>

                            <Link to={'/verPpis'}>
                                <div className='flex gap-3'>
                                <div className='h-10 flex items-center text-gray-600'>
                                    <IoCreateOutline style={{ width: 40, height: 40 }} />
                                </div>
                                <div className='sm:col-span-9 h-10 flex items-center sm:justify-start text-base font-medium'>
                                    Ver plantillas Ppi
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

export default AdminHome