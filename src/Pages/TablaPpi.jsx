import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';


function TablaPpi() {

    const { ppiNombre } = useParams();
    const [ppi, setPpi] = useState(null); // Estado para almacenar los datos del PPI

    useEffect(() => {
        const obtenerPpi = async () => {
            try {
                const q = query(collection(db, "ppis"), where("nombre", "==", ppiNombre));
                const querySnapshot = await getDocs(q);
                const ppiData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                if (ppiData.length > 0) {
                    console.log(ppiData[0]); // Asume que solo hay un PPI con ese nombre y toma el primero
                    setPpi(ppiData[0]); // Asume que solo hay un PPI con ese nombre y toma el primero
                } else {
                    console.log('No se encontró el PPI con el nombre:', ppiNombre);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener el PPI:', error);
            }
        };

        if (ppiNombre) {
            obtenerPpi();
        }
    }, [ppiNombre]); // Este efecto se ejecutará cada vez que ppiNombre cambie


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
                        <div className="whitespace-nowrap bg-white rounded rounded-xl">
                            <div className="bg-gray-100 text-gray-600 text-sm py-3 px-2 grid grid-cols-12">
                                <div className='whitespace-normal w-auto'>Nº</div> {/* Ajuste de ancho */}
                                <div className="whitespace-normal col-span-1">Actividad</div>
                                <div className="whitespace-normal col-span-2">Criterio de aceptación</div>
                                <div className="whitespace-normal text-center">Documentación de referencia</div>
                                <div>Tipo de inspección</div>
                                <div className='text-center'>Punto</div>
                                <div>Responsable</div>
                                <div>Fecha</div>
                                <div>Firma</div>
                                <div>Formulario</div>
                                <div>Apto</div>

                            </div>

                            <div className="text-gray-600 text-sm font-light">
                                <div className='border-b-2 grid grid-cols-12 items-center'>
                                    <div className="py-3 px-2 text-left whitespace-normal">1.1</div>
                                    <div className="py-3 px-2 whitespace-normal col-span-1">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].nombre : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left whitespace-normal col-span-2">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].criterio_aceptacion : ''}
                                    </div>
                                    <div className="py-3 px-2 text-center whitespace-normal">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].documentacion_referencia : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left whitespace-normal">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].tipo_inspeccion : ''}
                                    </div>
                                    <div className="py-3 px-2 text-center">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].punto : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left"></div>
                                    <div className="py-3 px-2 text-left">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 0 ? ppi.actividades[0].subactividades[0].fecha : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left"></div>
                                    <div className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </div>
                                    <div class="flex items-center">
                                        <input id="checkbox" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                        <label for="checkbox" class="ml-2 text-sm font-medium text-gray-900"></label>
                                    </div>
                                </div>

                                <div className='border-b-2 grid grid-cols-12'>
                                    <div className="py-3 px-2 text-left whitespace-normal">1.2</div>
                                    <div className="py-3 px-2 text-left whitespace-normal col-span-1">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].nombre : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left whitespace-normal col-span-2">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].criterio_aceptacion : ''}
                                    </div>
                                    <div className="py-3 px-2 text-center whitespace-normal">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].documentacion_referencia : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left whitespace-normal">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].tipo_inspeccion : ''}
                                    </div>
                                    <div className="py-3 px-2 text-center">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].punto : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left"></div>
                                    <div className="py-3 px-2 text-left">
                                        {ppi && ppi.actividades && ppi.actividades.length > 0 && ppi.actividades[0].subactividades && ppi.actividades[0].subactividades.length > 1 ? ppi.actividades[0].subactividades[1].fecha : ''}
                                    </div>
                                    <div className="py-3 px-2 text-left"></div>
                                    <div className="py-3 px-2 text-left">
                                        <Link to={'/formularioInspeccion'} className='flex justify-center'>
                                            <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                        </Link>
                                    </div>
                                    <div class="flex items-center">
                                        <input id="checkbox" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                        <label for="checkbox" class="ml-2 text-sm font-medium text-gray-900"></label>
                                    </div>

                                </div>


                                {/* Agregar más filas según sea necesario */}
                            </div>
                        </div>





                    </div>

                </div>
            </div>
        </div>

    )
}

export default TablaPpi;
