import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase_config';
import { getDoc, getDocs, query, collection, where, doc, updateDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { IoCloseCircle } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";

function TablaPpi() {
    const { ppiNombre, idLote } = useParams();
    const navigate = useNavigate();
    const [ppi, setPpi] = useState(null); // Estado para almacenar los datos del PPI

    useEffect(() => {
        const obtenerInspecciones = async () => {
            try {
                const inspeccionesRef = collection(db, "lotes", idLote, "inspecciones");
                const querySnapshot = await getDocs(inspeccionesRef);

                const inspeccionesData = querySnapshot.docs.map(doc => ({
                    docId: doc.id, // Almacena el ID del documento generado automáticamente por Firestore
                    ...doc.data()
                }));

                // Asegúrate de que este paso esté ajustado a cómo manejas los datos en tu aplicación
                if (inspeccionesData.length > 0) {
                    setPpi(inspeccionesData[0]); // O maneja múltiples inspecciones según sea necesario
                } else {
                    console.log('No se encontraron inspecciones para el lote con el ID:', idLote);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener las inspecciones:', error);
            }
        };



        obtenerInspecciones();
    }, [idLote]); // Dependencia del efecto basada en idLote





    const regresar = () => {
        navigate(-1); // Regresa a la página anterior
    };





    const [seleccionApto, setSeleccionApto] = useState({});
    const [tempSeleccion, setTempSeleccion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [modal, setModal] = useState(false);
    const [currentSubactividadId, setCurrentSubactividadId] = useState(null);




    const handleOpenModal = (subactividadId) => {
        setCurrentSubactividadId(subactividadId);
        // Inicializar la selección temporal con el valor actual si existe
        const valorActual = seleccionApto[subactividadId]?.valor;
        setTempSeleccion(valorActual);
        setModal(true);
    };



    const handleCloseModal = () => {
        setModal(false)

    };
    const handleGuardarTemporal = () => {
        // Solo muestra la confirmación, no aplica la selección todavía
        setMostrarConfirmacion(true);
    };

    const generarPseudoHash = (input) => {
        return input.split('').reduce((hash, char) => {
            let chr = char.charCodeAt(0);
            hash = (hash << 5) - hash + chr;
            return hash & hash;
        }, 0);
    };

    const handleConfirmarGuardar = () => {
        const fechaHoraActual = new Date().toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        const nombreResponsable = "Pablo Nistal";
        const marcaDeTiempo = `${fechaHoraActual} - ${nombreResponsable}`;
        const hashFirma = generarPseudoHash(marcaDeTiempo);

        if (currentSubactividadId && tempSeleccion !== null) {
            setSeleccionApto(prev => ({
                ...prev,
                [currentSubactividadId]: {
                    ...prev[currentSubactividadId],
                    valor: tempSeleccion,
                    guardado: true,
                    fecha: fechaHoraActual,
                    responsable: nombreResponsable,
                    firma: hashFirma.toString(), // Guarda el hash como firma.
                }
            }));

            // Si la selección es "Apto", agregar la subactividad
            if (tempSeleccion === "No apto") {
                const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);
                const subactividadOriginal = ppi.actividades[actividadIndex].subactividades[subactividadIndex];

                // Crea una nueva subactividad basada en la original
                const nuevaSubactividad = {
                    ...subactividadOriginal,
                    // Modifica aquí cualquier campo si es necesario
                };

                // Clona el estado actual de ppi para evitar mutaciones directas
                const nuevoPpi = { ...ppi };

                // Inserta la nueva subactividad directamente debajo de la subactividad actual
                nuevoPpi.actividades[actividadIndex].subactividades.splice(subactividadIndex + 1, 0, nuevaSubactividad);

                setPpi(nuevoPpi); // Actualiza el estado con el nuevo objeto ppi

                // Actualiza Firestore con el nuevo estado de ppi
                actualizarPpiEnFirestore(nuevoPpi).catch(console.error);
            }
        }

        // Cierra el modal y reinicia los estados relevantes
        setMostrarConfirmacion(false);
        setTempSeleccion(null);
        setModal(false);
    };











    const addSubactividad = (actividadIndex) => {
        const nuevaSubactividad = {
            numero: '',
            nombre: '',
            criterio_aceptacion: '',
            documentacion_referencia: '',
            tipo_inspeccion: '',
            punto: '',
            responsable: '',
            fecha: '',
            firma: ''
        };

        // Clona el estado actual de ppi para evitar mutaciones directas
        const nuevoPpi = { ...ppi };

        // Asegura que la actividad existe y tiene un array de subactividades
        if (nuevoPpi.actividades && nuevoPpi.actividades[actividadIndex]) {
            nuevoPpi.actividades[actividadIndex].subactividades.push(nuevaSubactividad);
        } else {
            console.error("Actividad no encontrada o estructura de datos inválida.");
            return;
        }

        setPpi(nuevoPpi);

        actualizarPpiEnFirestore(nuevoPpi).catch(console.error);


    };

    const actualizarPpiEnFirestore = async (nuevoPpi) => {
        try {
            // Verifica que nuevoPpi contenga docId
            if (!nuevoPpi.docId) {
                console.error("No se proporcionó docId para la actualización.");
                return;
            }

            const docRef = doc(db, "lotes", idLote, "inspecciones", nuevoPpi.docId);
            console.log(`Actualizando el documento en Firestore con ID: ${nuevoPpi.docId}`);

            await updateDoc(docRef, {
                actividades: nuevoPpi.actividades
            });

            console.log("PPI actualizado con éxito en Firestore.");
        } catch (error) {
            console.error("Error al actualizar PPI en Firestore:", error);
        }
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
                            <div className="col-span-1 text-center">Inspección</div>
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
                                    {/* <button
                                        type="button"
                                        onClick={() => addSubactividad(indexActividad)}
                                        className="mt-2 mb-2 bg-green-200"
                                    >
                                        Añadir Subactividad
                                    </button> */}
                                </div>,
                                // Rows for subactividades
                                ...actividad.subactividades.map((subactividad, indexSubactividad) => (
                                    <div key={`subactividad-${indexActividad}-${indexSubactividad}`} className="grid grid-cols-12 items-center border-b border-gray-200 text-sm">
                                         <div className="col-span-1 px-5 py-5 bg-white">
            {`${indexActividad + 1}.${indexSubactividad + 1}`}
        </div>
        <div className="col-span-1 px-5 py-5 bg-white">
            {subactividad.nombre}
            {indexSubactividad !== actividad.subactividades.length - 1 ? ' Repetición' : null}
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
                                            {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.guardado ? (
                                                <span className='font-medium'>Guardado</span> // Muestra el texto "Guardado" si la inspección ha sido guardada
                                            ) : (
                                                <Link to={`/formularioInspeccion/${idLote}/${ppi.id}`}>
                                                    <BsClipboardCheck style={{ width: 25, height: 25, fill: '#6b7280' }} />
                                                </Link> // Muestra el icono de formulario si la inspección no ha sido guardada
                                            )}
                                        </div>

                                        <div className={`col-span-1 px-5 py-5 bg-white flex items-center justify-center ${seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor === "No apto" ? 'bg-red-100 h-full' : seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor === "Apto" ? 'bg-green-100 h-full' : ''}`}>
                                            {(seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor === "Apto" || seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor === "No apto") ? (
                                                <span className={`font-bold text-md ${seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor === "Apto" ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor}
                                                </span> // Texto estático en lugar de botón
                                            ) : (
                                                <span
                                                    onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                    className="font-medium text-medium p-2 rounded text-white  text-sm cursor-pointer bg-yellow-500">
                                                    {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.valor || 'Pendiente'}
                                                </span>
                                            )}
                                        </div>





                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.responsable || ''}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {/* Aquí asumo que quieres mostrar la fecha en esta columna, ajusta según sea necesario */}
                                            {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.fecha || ''}
                                        </div>
                                        <div className="col-span-1 px-5 py-5 bg-white">
                                            {/* Muestra la marca de tiempo en la columna de firma */}
                                            {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.firma || ''}
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
                        <p className='font-normal my-4 flex items-center gap-2'>
                            <p className='text-red-600 text-lg'><IoWarningOutline /></p>
                            Al guardar el resultado de la inspección<strong className='font-medium'>no se puede modificar</strong></p>

                        <div className='mt-5 flex flex-col gap-2'>
                            <div>
                                <input
                                    type="radio"
                                    id="apto"
                                    value="Apto"
                                    name="evaluacion"
                                    checked={tempSeleccion === "Apto"}
                                    onChange={() => setTempSeleccion("Apto")}
                                />
                                <label htmlFor="apto" className="ml-2">Apto</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="noApto"
                                    value="No apto"
                                    name="evaluacion"
                                    checked={tempSeleccion === "No apto"}
                                    onChange={() => setTempSeleccion("No apto")}
                                />
                                <label htmlFor="noApto" className="ml-2">No apto</label>
                            </div>
                        </div>


                        {mostrarConfirmacion ? (
                            <div className='flex-col mt-6'>
                                {/* Mensaje de confirmación */}
                                <div className='flex flex-row items-center gap-2'>
                                    <p className='text-red-600 text-lg'><PiWarningCircleLight /></p>
                                    <p className='my-4'>¿Estás seguro de que quieres guardar esta selección?</p>
                                </div>
                                <div className='flex gap-5'>
                                    <button onClick={handleConfirmarGuardar} className='bg-sky-600 px-6 py-2 text-white font-medium rounded-lg shadow-md'>Confirmar</button>
                                    <button onClick={() => {
                                        setMostrarConfirmacion(false);
                                        handleCloseModal()
                                    }} className='bg-gray-500 px-4 py-2 text-white font-medium rounded-lg shadow-md'>Cancelar</button>
                                </div>

                            </div>
                        ) : (
                            <div className='mt-6'>
                                <div className='flex gap-5'>
                                    <button onClick={handleGuardarTemporal} className='bg-sky-600 px-6 py-2 text-white font-medium rounded-lg shadow-md'>Guardar</button>
                                    <button onClick={handleCloseModal} className='bg-gray-500 px-4 py-2 text-white font-medium rounded-lg shadow-md '>Cancelar</button>
                                </div>

                            </div>
                        )}

                    </div>

                </div>
            )}


        </div>


    );
}

export default TablaPpi;
