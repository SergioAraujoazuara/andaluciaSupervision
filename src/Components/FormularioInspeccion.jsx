import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { HiClipboardDocumentCheck } from "react-icons/hi2";

function FormularioInspeccion() {
    const proyectoNombre = localStorage.getItem('proyectoNombre')
    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>

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

                    <h1 className='font-bold text-xl text-gray-500  px-5 '>Formulario</h1>
                </div>

                <div className='border-t-2 w-full p-0 m-0'></div>




                <div class="w-full rounded rounded-xl  mt-5">


                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                        <div className='grid sm:grid-cols-4 grid-cols-1 gap-4'>
                            <div className="mb-4">
                                <label htmlFor="Proyecto" className="block text-gray-700 text-sm font-bold mb-2">Proyecto</label>
                                <input type="text" id="Proyecto" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" value={proyectoNombre} />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="registro" className="block text-gray-700 text-sm font-bold mb-2">Nª de registro</label>
                                <input type="text" id="registro" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="Fecha" className="block text-gray-700 text-sm font-bold mb-2">Fecha</label>
                                <input type="date" id="Fecha" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="Obra" className="block text-gray-700 text-sm font-bold mb-2">Obra</label>
                                <input type="text" id="Obra" placeholder="Nombre de la obra" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="Tramo" className="block text-gray-700 text-sm font-bold mb-2">Tramo</label>
                                <input type="text" id="Tramo" placeholder="Nombre del tramo" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="Ppi" className="block text-gray-700 text-sm font-bold mb-2">Ppi</label>
                                <input type="text" id="Ppi" placeholder="Nombre del Ppi" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="plano" className="block text-gray-700 text-sm font-bold mb-2">Plano que aplica</label>
                                <input type="text" id="plano" placeholder="Nombre del plano" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                            <div className="mb-4">
  <label htmlFor="imagen" className="block text-gray-700 text-sm font-bold mb-2">Seleccionar imagen</label>
  <input type="file" id="imagen" accept="image/*" className=" rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
</div>


                            <div className="mb-4 sm:col-span-4">
                                <label htmlFor="Observaciones" className="block text-gray-700 text-sm font-bold mb-2">Observaciones</label>
                                <textarea type="text" id="Observaciones" placeholder="Observaciones" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Trazabilidad</label>
                            <div className="grid sm:grid-cols-4 grid-cols-1 gap-4">
                                <div>
                                    <label htmlFor="Sector" className="block text-gray-700 text-sm font-bold mb-2">Sector</label>
                                    <input type="text" id="Sector" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="SubSector" className="block text-gray-700 text-sm font-bold mb-2">Sub sector</label>
                                    <input type="text" id="SubSector" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="Parte" className="block text-gray-700 text-sm font-bold mb-2">Parte</label>
                                    <input type="text" id="Parte" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="Elemento" className="block text-gray-700 text-sm font-bold mb-2">Elemento</label>
                                    <input type="text" id="Elemento" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="Lote" className="block text-gray-700 text-sm font-bold mb-2">Lote</label>
                                    <input type="text" id="Lote" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="PkInicial" className="block text-gray-700 text-sm font-bold mb-2">Pk inicial</label>
                                    <input type="text" id="PkInicial" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                                <div>
                                    <label htmlFor="PkFinal" className="block text-gray-700 text-sm font-bold mb-2">Pk final</label>
                                    <input type="text" id="PkFinal" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Guardar</button>
                        </div>
                    </form>


                </div>

            </div>







        </div>
    )
}

export default FormularioInspeccion