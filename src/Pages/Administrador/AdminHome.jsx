import React from 'react'

import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";

import { IoCreateOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineEditLocation } from "react-icons/md";
import { IoArrowBackCircle } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";


function AdminHome() {
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/'); // Esto navega hacia atrás en la historia
    };
    const idProyecto = localStorage.getItem('proyecto')
    return (
        <div className='min-h-screen container mx-auto px-14 py-5 text-gray-500'>

            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>

                <div className='flex gap-2 items-center'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />


                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Administración</h1>
                    </Link>
                </div>


                <div className='flex items-center'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>

            </div>


            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>




                    <div class="w-full rounded rounded-xl">


                        <div className='cursor-pointer flex flex-col gap-20 items-start justify-start p-10
     '>



                            <Link to={`/trazabilidad/${idProyecto}`}>
                                <div className='flex gap-10 items-center '>
                                    <div className=' flex items-center text-gray-600'>
                                        <span ><IoCreateOutline className='w-[100px] h-[100px]' /></span>
                                    </div>
                                    <div className='sm:col-span-9 h-10 flex flex-col justify-center items-start sm:justify-center text-base font-medium'>
                                        <p>Administrar proyecto</p>
                                        <p className='mt-4 font-normal'>Creación y configuración del proyecto,
                                            agregar la trazabilidad completa del proyecto, establecer parámetros como el sector, sub sector, parte, elemento, lote y asignar PPI
                                            Puedes agregar los datos en 2 visualizaciones distintas:
                                            <br />
                                            - Versión web
                                            <br />
                                            - Versión BIM
                                        </p>
                                        <button

                                            className="text-gray-500 mt-2 flex items-center gap-3 font-semibold bg-white py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                                            Comenzar
                                        </button>
                                    </div>
                                </div>

                            </Link>
                            

                            
                            <Link className='mt-10' to={'/verPpis'}>
                                <div className='flex gap-10 items-center '>
                                    <div className=' flex items-center text-gray-600'>
                                        <span ><MdOutlineEditLocation className='w-[100px] h-[100px]' /></span>
                                    </div>
                                    <div className='sm:col-span-9 h-10 flex flex-col justify-center items-start sm:justify-center text-base font-medium'>
                                        <p>Plantillas PPI</p>
                                        <p className='mt-4 font-normal'>Creación y edición de plantillas de puntos de inspección (PPI).
                                        
                                        </p>
                                        <button

                                            className="text-gray-500 mt-2 flex items-center gap-3 font-semibold bg-white py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                                            Comenzar
                                        </button>
                                    </div>
                                </div>

                            </Link>

                            <Link to={'/verPpis'}>
                                <div className='flex gap-10 items-center '>
                                    <div className=' flex items-center text-gray-600'>
                                        <span ><FaCircleUser className='w-[100px] h-[100px]' /></span>
                                    </div>
                                    <div className='sm:col-span-9 h-10 flex flex-col justify-center items-start sm:justify-center text-base font-medium'>
                                        <p>Roles usuarios</p>
                                        <p className='mt-4 font-normal'>Asignar y editar roles a los usuarios registrados del proyecto:
                                          
                                        </p>
                                        <button

                                            className="text-gray-500 mt-2 flex items-center gap-3 font-semibold bg-white py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                                            Comenzar
                                        </button>
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