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
import { IoCheckmarkCircle } from "react-icons/io5";
import { FaClock } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import FormularioInspeccion from '../Components/FormularioInspeccion'

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
        const valorActual = seleccionApto[subactividadId]?.resultadoInspeccion;
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

    const handleConfirmarGuardar = async () => {
        const fechaHoraActual = new Date().toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        const nombreResponsable = "Usuario";
        const marcaDeTiempo = `${fechaHoraActual} - ${nombreResponsable}`;
        const hashFirma = generarPseudoHash(marcaDeTiempo + comentario);

        if (currentSubactividadId && tempSeleccion !== null) {
            // Encuentra el índice de la actividad y de la subactividad desde el ID
            const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);

            // Prepara la evaluación de la subactividad seleccionada
            const evaluacionSubactividad = {
                resultadoInspeccion: tempSeleccion,
                enviado: true,
                fecha: fechaHoraActual,
                responsable: nombreResponsable,
                firma: hashFirma.toString(),
                comentario: comentario,
            };

            // Actualiza siempre la subactividad seleccionada con la nueva evaluación
            let subactividadActualizada = { ...ppi.actividades[actividadIndex].subactividades[subactividadIndex], ...evaluacionSubactividad };
            ppi.actividades[actividadIndex].subactividades[subactividadIndex] = subactividadActualizada;

            // Si la evaluación es "No apto", agrega una nueva subactividad para una futura inspección
            if (tempSeleccion === "No apto") {
                let nuevaSubactividad = { ...subactividadActualizada };
                const numeroPartes = subactividadActualizada.numero.split('.');
                if (numeroPartes.length === 2) {
                    nuevaSubactividad.numero += ".1";
                } else if (numeroPartes.length > 2) {
                    let repeticion = parseInt(numeroPartes.pop(), 10) + 1;
                    numeroPartes.push(repeticion.toString());
                    nuevaSubactividad.numero = numeroPartes.join('.');
                }

                // La nueva subactividad copiada no debe incluir los datos específicos de la evaluación
                delete nuevaSubactividad.resultadoInspeccion;
                delete nuevaSubactividad.enviado;
                delete nuevaSubactividad.fecha;
                delete nuevaSubactividad.responsable;
                delete nuevaSubactividad.firma;
                delete nuevaSubactividad.comentario;

                ppi.actividades[actividadIndex].subactividades.splice(subactividadIndex + 1, 0, nuevaSubactividad);
            }

            // Actualiza Firestore con el nuevo objeto ppi
            await actualizarPpiEnFirestore(ppi);

            // Limpia el formulario y cierra el modal
            setComentario('');
            setMostrarConfirmacion(false);
            setTempSeleccion(null);
            setModal(false);
        }
    };


    // No olvides definir la función actualizarPpiEnFirestore si aún no lo has hecho. Esta debería manejar la actualización de Firestore con el objeto ppi modificado.











    const actualizarPpiEnFirestore = async (nuevoPpi) => {
        if (!nuevoPpi.docId) {
            console.error("No se proporcionó docId para la actualización.");
            return;
        }

        try {
            // Aquí, "docId" es el ID del documento de Firestore donde se almacenan los datos del PPI.
            const ppiRef = doc(db, "lotes", idLote, "inspecciones", nuevoPpi.docId);

            // Prepara los datos que se van a actualizar. En este caso, actualizamos todo el objeto de actividades.
            const updatedData = {
                actividades: nuevoPpi.actividades.map(actividad => ({
                    ...actividad,
                    subactividades: actividad.subactividades.map(subactividad => ({
                        numero: subactividad.numero,
                        nombre: subactividad.nombre,
                        criterio_aceptacion: subactividad.criterio_aceptacion,
                        documentacion_referencia: subactividad.documentacion_referencia,
                        tipo_inspeccion: subactividad.tipo_inspeccion,
                        punto: subactividad.punto,
                        responsable: subactividad.responsable || '',
                        fecha: subactividad.fecha || '',
                        firma: subactividad.firma || '',
                        comentario: subactividad.comentario || '',
                        resultadoInspeccion: subactividad.resultadoInspeccion || ''
                        // Agrega aquí más campos si son necesarios.
                    }))
                }))
            };

            // Realiza la actualización en Firestore.
            await updateDoc(ppiRef, updatedData);

            console.log("PPI actualizado con éxito en Firestore.");
        } catch (error) {
            console.error("Error al actualizar PPI en Firestore:", error);
        }
    };


    // agregar cometarios
    const [comentario, setComentario] = useState("");






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
                        <div className="w-full bg-gray-200 text-gray-600 text-sm font-medium py-3 px-3 grid grid-cols-24">
                            <div className='col-span-1'>Nº</div>
                            <div className="col-span-3">Actividad</div>
                            <div className="col-span-3">Criterio de aceptación</div>
                            <div className="col-span-2 text-center">Documentación de referencia</div>
                            <div className="col-span-2 text-center">Tipo de inspección</div>
                            <div className="col-span-1 text-center">Punto</div>
                            <div className="col-span-2 text-center">Responsable</div>
                            <div className="col-span-2 text-center">Fecha</div>
                            <div className="col-span-3 text-center">Comentarios</div>
                            <div className="col-span-2 text-center">Estatus</div>
                            <div className="col-span-1 text-center">Formulario</div>
                            <div className="col-span-2 text-center">Inspección</div>

                        </div>


                        <div>
                            {ppi && ppi.actividades.map((actividad, indexActividad) => [
                                // Row for activity name
                                <div key={`actividad-${indexActividad}`} className="bg-gray-100 grid grid-cols-24 items-center px-3 py-3 border-b border-gray-200 text-sm font-medium">
                                    <div className="col-span-1">

                                        {actividad.numero}

                                    </div>
                                    <div className="col-span-23">

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
                                    <div key={`subactividad-${indexActividad}-${indexSubactividad}`} className="grid grid-cols-24 items-center border-b border-gray-200 text-sm">
                                        <div className="col-span-1 px-3 py-5 bg-white">
                                            {subactividad.numero} {/* Combina el número de actividad y el índice de subactividad */}
                                        </div>
                                        <div className="col-span-3 px-3 py-5 bg-white">
                                            {subactividad.nombre}
                                        </div>

                                        <div className="col-span-3 px-3 py-5 bg-white">
                                            {subactividad.criterio_aceptacion}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 bg-white text-center">
                                            {subactividad.documentacion_referencia}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 bg-white text-center">
                                            {subactividad.tipo_inspeccion}
                                        </div>
                                        <div className="col-span-1 px-3 py-5 bg-white text-center">
                                            {subactividad.punto}
                                        </div>




                                        <div className="col-span-2 px-3 py-5 bg-white text-center">
                                            {subactividad.responsable || ''}
                                        </div>
                                        <div className="col-span-2 px-5 py-5 bg-white">
                                            {/* Aquí asumo que quieres mostrar la fecha en esta columna, ajusta según sea necesario */}
                                            {subactividad.fecha || ''}
                                        </div>
                                        <div className="col-span-3 px-5 py-5 bg-white text-center">
                                            {subactividad.comentarios || ''}
                                        </div>
                                        <div className={`col-span-2 px-5 py-5 bg-white text-center`}>
                                            {
                                                subactividad.resultadoInspeccion === "Apto" ? (
                                                    <span className='text-teal-500 font-bold text-3xl flex justify-center'><IoCheckmarkCircle /></span>
                                                ) : subactividad.resultadoInspeccion === "No apto" ? (
                                                    <div><span className='text-red-500 font-bold text-3xl flex justify-center'><IoMdCloseCircle /></span><p className='text-red-500 font-bold'>Repetir</p></div>
                                                ) : (
                                                    <span className='text-yellow-500 font-bold text-2xl flex justify-center'><FaClock /></span>
                                                )
                                            }
                                        </div>


                                        <div className="col-span-1 px-5 py-5 bg-white flex justify-center">
                                            {seleccionApto[`apto-${indexActividad}-${indexSubactividad}`]?.enviado ? (
                                                <span className='font-medium'>Enviado</span> // Muestra el texto "Guardado" si la inspección ha sido guardada
                                            ) : (
                                                <Link to={`/formularioInspeccion/${idLote}/${ppi.id}`}>
                                                    <span className='text-gray-500 text-3xl font-bold'><BsClipboardCheck /></span>
                                                </Link> // Muestra el icono de formulario si la inspección no ha sido guardada
                                            )}
                                        </div>
                                        <div className={`col-span-2 px-5 py-5 bg-white flex items-center justify-center ${subactividad.resultadoInspeccion === "No apto" ? 'bg-red-100 h-full' :
                                                subactividad.resultadoInspeccion === "Apto" ? 'bg-green-100 h-full' : ''
                                            }`}>
                                            {subactividad.resultadoInspeccion === "Apto" || subactividad.resultadoInspeccion === "No apto" ? (
                                                <span className={`font-bold text-white px-2 py-2 rounded-md w-full shadow-md text-md text-center ${subactividad.resultadoInspeccion === "Apto" ? 'bg-teal-500' :
                                                        'bg-red-500'
                                                    }`}>
                                                    {subactividad.resultadoInspeccion}
                                                </span> // Texto estático en lugar de botón
                                            ) : (
                                                <span
                                                    onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                    className="font-bold text-medium p-2 rounded text-white w-full text-center text-sm cursor-pointer bg-yellow-500">
                                                    {'Pendiente'}
                                                </span>
                                            )}
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

                    <div className="w-full h-full modal-container bg-white mx-auto rounded shadow-lg z-50 overflow-y-auto p-5"
                     >
                        <button onClick={handleCloseModal} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>

                        <div>
                                    <FormularioInspeccion/>
                                </div>

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

                        <div className='mt-5'>
                            <label htmlFor="comentario" className="block text-sm font-medium text-gray-700">
                                Comentarios
                            </label>
                            <textarea
                                id="comentario"
                                name="comentario"
                                rows="3"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                placeholder="Agrega tus comentarios aquí..."
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                            ></textarea>
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
