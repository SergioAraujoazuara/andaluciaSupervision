import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";

function TablaPpi() {
 


    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/elemento'}>
                    <h1 className='text-gray-500 text-gray-500'>Elementos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>PPI</h1>
                </Link>

            </div>


            <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>



                <div class="w-full rounded rounded-xl ">
                    <div className="overflow-x-auto rounded rounded-lg">
                        <table className=" whitespace-nowrap bg-white rounded rounded-xl">
                            <thead className="bg-gray-100 text-gray-600 text-sm">
                                <tr>
                                    <th className="py-3 px-2 text-left">Nº</th>
                                    <th className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-14">Actividad</th>
                                    <th className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-40">Criterio de aceptación</th>
                                    <th className="py-3 px-2 text-left whitespace-normal overflow-auto max-w-32">Documentación de referencia</th>
                                    <th className="py-3 px-2 text-left">Tipo de inspección</th>
                                    <th className="py-3 px-2 text-left">Punto</th>
                                    <th className="py-3 px-2 text-left">Responsable</th>
                                    <th className="py-3 px-2 text-left">Fecha</th>
                                    <th className="py-3 px-2 text-left">Firma</th>
                                    <th className="py-3 px-2 text-left">Formulario</th>

                                </tr>
                            </thead>

                            <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                                <th className="py-3 px-2 text-left font-bold">1</th>
                                <th className="py-3 px-2 text-left font-bold" colSpan={10}>Actividades previas</th>
                            </tr>


                            <tbody className="text-gray-600 text-sm font-light">
                                <tr className='border-b-2'>
                                    <td className="py-3 px-2 text-left">1.1</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-10">Inicio de tajo</td>

                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto">
                                        El registro de Inicio de tajo para esta actividad se encuentra cumplimentado, firmado y sin incidencias. Se han revisado los procedimientos de seguridad y se han tomado las medidas preventivas necesarias.
                                    </td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">PC</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Documental/Visual</td>
                                    <td className="py-3 px-2 text-left">P</td>
                                    <td className="py-3 px-2 text-left">Jefe de Calidad</td>
                                    <td className="py-3 px-2 text-left">xx/xx/xx</td>
                                    <td className="py-3 px-2 text-left"></td>
                                    <td className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </td>
                                </tr>

                                <tr className='border-b-2'>
                                    <td className="py-3 px-2 text-left">1.2</td>
                                    <td className="py-3 px-2 text-left">Documentación actualizada y planos válidos</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-42">
                                        Se dispone de toda la documentación y planos vigentes para realizar las inspecciones.
                                    </td>

                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Planos</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Documental</td>
                                    <td className="py-3 px-2 text-left">C</td>
                                    <td className="py-3 px-2 text-left">Vigilante</td>

                                    <td className="py-3 px-2 text-left">xx/xx/xx</td>
                                    <td className="py-3 px-2 text-left"></td>
                                    <td className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </td>

                                </tr>

                                <tr className="bg-gray-200 text-gray-600 text-sm leading-normal">
                                    <th className="py-3 px-2 text-left font-bold">2</th>
                                    <th className="py-3 px-2 text-left font-bold" colSpan={10}>Excavación</th>
                                </tr>

                                <tr className='border-b-2'>
                                    <td className="py-3 px-2 text-left">2.1</td>
                                    <td className="py-3 px-2 text-left">Dimensiones</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-42">
                                        "Documentación actualizada y planos válidos para construir,
                                        Se comprueba que se tiene la información necesaria para el inicio de la actividad"
                                    </td>

                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Planos</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Topográfica</td>
                                    <td className="py-3 px-2 text-left">P</td>
                                    <td className="py-3 px-2 text-left">Topógrafo</td>

                                    <td className="py-3 px-2 text-left">xx/xx/xx</td>
                                    <td className="py-3 px-2 text-left"></td>
                                    <td className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </td>

                                </tr>

                                <tr className='border-b-2'>
                                    <td className="py-3 px-2 text-left">2.2</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-14">Estado del fondo de excavación cimentaciones y/o superficie de apoyo del encofrado o cimbra </td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-42">
                                        "Fondo de excavación compactado y aprobado cumpliendo lo especificado en PPTP
                                        Superficie limpia y húmeda pero sin charcos
                                        Hormigón de limpieza conforme a planos de proyecto"
                                    </td>

                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">"PPTP
                                        EHE"</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Documental</td>
                                    <td className="py-3 px-2 text-left">P</td>
                                    <td className="py-3 px-2 text-left">Jefe de calidad</td>

                                    <td className="py-3 px-2 text-left">xx/xx/xx</td>
                                    <td className="py-3 px-2 text-left"></td>
                                    <td className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </td>

                                </tr>

                                <tr className='border-b-2'>
                                    <td className="py-3 px-2 text-left">2.3</td>
                                    <td className="py-3 px-2 text-left">Comprobación de fondo </td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-42">
                                        Comprobación topografica del fondo de excavación, tolerancia menor de 10 cm.
                                    </td>

                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">"PPTP
                                        Planos"</td>
                                    <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Topográfica</td>
                                    <td className="py-3 px-2 text-left">P</td>
                                    <td className="py-3 px-2 text-left">Topográfica</td>

                                    <td className="py-3 px-2 text-left">xx/xx/xx</td>
                                    <td className="py-3 px-2 text-left"></td>
                                    <td className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </td>

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
