import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { HiClipboardDocumentCheck } from "react-icons/hi2";

function TablaPpi() {
    const proyectoNombre = localStorage.getItem('proyectoNombre')



    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='text-gray-500 text-gray-500'>Módulos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='text-gray-500 text-gray-500'>Elementos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/modulos'}>
                    <h1 className='font-medium text-amber-600'>Formulario</h1>
                </Link>
                <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-md shadow-md' style={{ marginLeft: 'auto' }}>{proyectoNombre}</button>
            </div>


            <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                <div className='flex gap-2 items-center'>

                    <h1 className='font-bold text-xl text-gray-500 px-5'>Formulario</h1>
                </div>

                <div className='border-t-2 w-full p-0 m-0'></div>

                <div class="w-full rounded rounded-xl ">
                    <div className="overflow-x-auto rounded rounded-lg">
                        <table className="min-w-full bg-white rounded rounded-xl ">
                            <thead className="bg-gray-100 text-gray-600 text-sm leading-normal">
                                <tr>
                                    <th className="py-3 px-6 text-left ">Nª</th>
                                    <th className="py-3 px-6 text-left">Actividad</th>
                                    <th className="py-3 px-6 text-left">Criterio de aceptación</th>
                                    <th className="py-3 px-6 text-left w-10">Documentación de referencia</th>
                                    <th className="py-3 px-6 text-left">Tipo de inspección</th>
                                    <th className="py-3 px-6 text-left">Punto</th>
                                    <th className="py-3 px-6 text-left">Responsable</th>
                                    <th className="py-3 px-6 text-left">Fecha</th>
                                    <th className="py-3 px-6 text-left">Firma</th>
                                    <th className="py-3 px-6 text-left">Formulario</th>
                                </tr>
                            </thead>
                            <thead className="bg-gray-200 text-gray-600 text-sm leading-normal ">
                                <tr>
                                    <th className="py-3 px-6 text-left font-bold">1</th>
                                    <th className="py-3 px-6 text-left font-bold" colSpan={'9'}>Actividades previas</th>
                                </tr>
                            </thead>

                            <tbody className="text-gray-600 text-sm font-light">
                                <tr className='border-b-2'>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">1.1</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">Inicio de tajo</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">El registro de Inicio de tajo para esta actividad se encuentra cumplimentado, firmado y sin incidencias</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">PC</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">"Documental/
                                        Visual"</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">P</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">Jefe de Calidad</td>

                                    <td className="py-3 px-6 text-left whitespace-nowrap">Dato 8</td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">Dato 9</td>
                                    <Link to={'/formularioInspeccion'}>
                                    <td className="py-3 px-6 text-left whitespace-nowrap"><HiClipboardDocumentCheck style={{ width: 25, height: 25, fill: '#6b7280' }} /></td>
                                    </Link>
                                </tr>
                                
                                {/* Agregar más filas según sea necesario */}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default TablaPpi;
