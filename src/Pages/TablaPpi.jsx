import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase_config';
import { getDocs, query, collection, where } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { IoCloseCircle } from "react-icons/io5";

function TablaPpi() {
    const { ppiNombre, idLote } = useParams();
    const navigate = useNavigate();
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
                    console.log(ppiData[0]);
                    setPpi(ppiData[0]);
                } else {
                    console.log('No se encontró el PPI con el nombre:', ppiNombre);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener el PPI:', error);
            }
        };

        obtenerPpi();
    }, [ppiNombre]);



    const regresar = () => {
        navigate(-1); // Regresa a la página anterior
    };





    const [seleccionApto, setSeleccionApto] = useState({});
    const [modal, setModal] = useState(false);
    const [currentSubactividadId, setCurrentSubactividadId] = useState(null);




    const handleOpenModal = (subactividadId) => {
        setCurrentSubactividadId(subactividadId);
        setModal(true);
    };


    const handleCloseModal = () => {
        setModal(false)

    };
    const handleChange = (idSubactividad, valor) => {
        setSeleccionApto(prev => ({
            ...prev,
            [idSubactividad]: valor
        }));

    };


    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className=' text-gray-500'>Inicio</h1>
                </Link>

                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />

                <h1 className='cursor-pointer text-gray-500' onClick={regresar}>Elementos</h1>

                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Ppi</h1>
                </Link>

            </div>

            <div className='flex gap-3 flex-col mt-5 bg-white p-8 rounded-xl shadow-md'>
                <div className="w-full rounded-xl overflow-x-auto">
                    <div>
                        <div className="w-full bg-gray-200 text-gray-600 text-sm font-medium py-3 px-2 grid grid-cols-12">
                            <div className='col-span-1'>Nº</div>
                            <div className="col-span-1">Actividad</div>
                            <div className="col-span-2">Criterio de aceptación</div>
                            <div className="col-span-1 text-center">Documentación de referencia</div>
                            <div className="col-span-1">Tipo de inspección</div>
                            <div className="col-span-1 text-center">Punto</div>
                            <div className="col-span-1 text-center">Formulario</div>
                            <div className="col-span-1 text-center">Apto</div>
                            <div className="col-span-1">Responsable</div>
                            <div className="col-span-1">Fecha</div>
                            <div className="col-span-1">Firma</div>

                        </div>

                        <div>
                            {ppi && ppi.actividades.map((actividad, indexActividad) => [
                                // Row for activity name
                                <div key={`actividad-${indexActividad}`} className="bg-gray-100 grid grid-cols-12 items-center px-5 py-3 border-b border-gray-200 text-sm font-medium">
                                    <div className="col-span-1">

                                        {actividad.numero}

                                    </div>
                                    <div className="col-span-11">

                                        {actividad.actividad}

                                    </div>
                                </div>,
                                // Rows for subactividades
                                ...actividad.subactividades.map((subactividad, indexSubactividad) => (
                                    <div key={`subactividad-${indexActividad}-${indexSubactividad}`} className="grid grid-cols-12 items-center border-b border-gray-200 text-sm">
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {`${indexActividad + 1}.${indexSubactividad + 1}`}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {subactividad.nombre}
                                        </div>
                                        <div className="col-span-2 px-5 py-5 bg-white">
                                            {subactividad.criterio_aceptacion}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {subactividad.documentacion_referencia}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {subactividad.tipo_inspeccion}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white text-center">
                                            {subactividad.punto}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white flex justify-center">
                                            <Link to={`/formularioInspeccion/${idLote}/${ppi.id}`}>
                                                <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                            </Link>
                                        </div>

                                        <div className="col-span-1 px-5 py-5 bg-white flex justify-center">
                                            <button onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)} className='bg-red-700 text-white text-medium p-2 rounded'>Sin evaluar</button>

                                        </div>


                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {/* Asumiendo que "responsable" es una propiedad disponible */}
                                            {subactividad.responsable}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {subactividad.fecha}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white flex justify-center">
                                            {/* Firma - Si es un enlace o representación, ajustar según sea necesario */}
                                        </div>

                                    </div>
                                ))
                            ])}
                        </div>
                    </div>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                    <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                    <div className="modal-container bg-white mx-auto rounded shadow-lg z-50 overflow-y-auto p-5"
                        style={{ width: '620px', height: 'auto', maxWidth: '100%' }}>
                        <button onClick={handleCloseModal} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>

                        <h2 className='font-medium text-xl my-4'>Resultado de la inspeccion de la obra</h2>
                        <p className='font-medium my-4'><strong className='text-amber-600 text-xl'>*</strong>Al guardar el resultado se cerrara el ppi y no podras modificarlo</p>

                        <div>
                            <div>
                                <label>
                                    <input type="radio" value="Apto" name="evaluacion"
                                        checked={seleccionApto[currentSubactividadId] === "Apto"}
                                        onChange={() => handleChange(currentSubactividadId, "Apto")} />
                                    Apto
                                </label>
                            </div>
                            <div className='mt-2'>
                                <label>
                                    <input type="radio" value="No apto" name="evaluacion"
                                        checked={seleccionApto[currentSubactividadId] === "No apto"}
                                        onChange={() => handleChange(currentSubactividadId, "No apto")} />
                                    No apto
                                </label>
                            </div>
                        </div>

                        <div className='flex gap-5 mt-10'>
                            <button className='bg-sky-600 px-4 py-2 text-white font-medium rounded-lg shadow-md'>Guardar</button>
                            <button className='bg-gray-500 px-4 py-2 text-white font-medium rounded-lg shadow-md'>Cancelar</button>
                        </div>

                    </div>

                </div>
            )}


        </div>


    );
}

export default TablaPpi;
