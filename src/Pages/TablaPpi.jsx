import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";

function TablaPpi() {
    const nombre_proyecto = localStorage.getItem('nombre_proyecto')



    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/ppi'}>
                    <h1 className='text-gray-500 text-gray-500'>PPI</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Formulario</h1>
                </Link>

            </div>


            <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                <div className='flex gap-2 items-center'>

                    <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-lg shadow-md'>{nombre_proyecto}</button>
                </div>

                <div className='border-t-2 w-full p-0 m-0'></div>

                <div class="w-full rounded rounded-xl ">
                    <div className="overflow-x-auto rounded rounded-lg">
                    <table className="w-full whitespace-nowrap bg-white rounded rounded-xl">
    <thead className="bg-gray-100 text-gray-600 text-sm leading-normal">
        <tr>
            <th className="py-3 px-2 text-left">Nº</th>
            <th className="py-3 px-2 text-left">Actividad</th>
            <th className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-20">Criterio de aceptación</th>
            <th className="py-3 px-2 text-left whitespace-normal overflow-auto max-w-32">Documentación de referencia</th>
            <th className="py-3 px-2 text-left">Tipo de inspección</th>
            <th className="py-3 px-2 text-left">Punto</th>
            <th className="py-3 px-2 text-left">Responsable</th>
            <th className="py-3 px-2 text-left">Fecha</th>
            <th className="py-3 px-2 text-left">Firma</th>
            <th className="py-3 px-2 text-left">Inspección</th>
            <th className="py-3 px-2 text-left">Ensayo</th>
        </tr>
    </thead>
    <thead className="bg-gray-200 text-gray-600 text-sm leading-normal">
        <tr>
            <th className="py-3 px-2 text-left font-bold">1</th>
            <th className="py-3 px-2 text-left font-bold" colSpan={10}>Actividades previas</th>
        </tr>
    </thead>

    <tbody className="text-gray-600 text-sm font-light">
        <tr className='border-b-2'>
            <td className="py-3 px-2 text-left">1.1</td>
            <td className="py-3 px-2 text-left">Inicio de tajo</td>
            <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24 sm:max-w-42">
  El registro de Inicio de tajo para esta actividad se encuentra cumplimentado, firmado y sin incidencias. Se han revisado los procedimientos de seguridad y se han tomado las medidas preventivas necesarias.
</td>

            <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">PC</td>
            <td className="py-3 px-2 text-left whitespace-normal overflow-auto max-h-24">Documental/Visual</td>
            <td className="py-3 px-2 text-left">P</td>
            <td className="py-3 px-2 text-left">Jefe de Calidad</td>

            <td className="py-3 px-2 text-left">Dato 8</td>
            <td className="py-3 px-2 text-left">Dato 9</td>
            <td className="py-3 px-2 text-left">
                <Link to={'/formularioInspeccion'} className='flex justify-center'>
                    <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                </Link>
            </td>
            <td className="py-3 px-2 text-left">
                <Link to={'/formularioInspeccion'} className='flex justify-center'>
                    <GrDocumentTest style={{ width: 25, height: 25, fill: '#6b7280' }} />
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
