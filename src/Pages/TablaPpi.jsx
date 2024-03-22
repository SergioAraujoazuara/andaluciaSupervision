import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase_config';
import { getDoc, getDocs, query, collection, where, doc, updateDoc, increment } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { IoCloseCircle } from "react-icons/io5";
import { IoWarningOutline } from "react-icons/io5";
import { PiWarningCircleLight } from "react-icons/pi";
import { IoMdAddCircle } from "react-icons/io";
import FormularioInspeccion from '../Components/FormularioInspeccion'

function TablaPpi() {
    const { idLote } = useParams();
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
                    setPpi(inspeccionesData[0]);
                    setPpiNombre(inspeccionesData[0].nombre) // O maneja múltiples inspecciones según sea necesario
                } else {
                    console.log('No se encontraron inspecciones para el lote con el ID:', idLote);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener las inspecciones:', error);
            }
        };



        obtenerInspecciones();
        console.log(ppi)
    }, [idLote]); // Dependencia del efecto basada en idLote

    useEffect(() => {

        console.log(ppi)
    }, []);




    const regresar = () => {
        navigate(-1); // Regresa a la página anterior
    };





    const [seleccionApto, setSeleccionApto] = useState({});
    const [tempSeleccion, setTempSeleccion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalFormulario, setModalFormulario] = useState(false);
    const [currentSubactividadId, setCurrentSubactividadId] = useState(null);

    const [ppiNombre, setPpiNombre] = useState('');






    const handleOpenModal = (subactividadId) => {
        setCurrentSubactividadId(subactividadId);
        console.log(subactividadId)
        // Inicializar la selección temporal con el valor actual si existe
        const valorActual = seleccionApto[subactividadId]?.resultadoInspeccion;
        setTempSeleccion(valorActual);
        setModal(true);
    };

    const handleOpenModalFormulario = (subactividadId) => {


        setCurrentSubactividadId(subactividadId);
        console.log(subactividadId)
        // Inicializar la selección temporal con el valor actual si existe
        const valorActual = seleccionApto[subactividadId]?.resultadoInspeccion;
        setTempSeleccion(valorActual);
        setModalFormulario(true);
    };



    const handleCloseModal = () => {
        setModal(false)
        setModalFormulario(false)

    };

    const handleGuardarTemporal = () => {
        // Solo muestra la confirmación, no aplica la selección todavía
        setMostrarConfirmacion(true);
    };

    const handleConfirmarGuardar = async () => {
        const fechaHoraActual = new Date().toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });

        const hashFirma = 'GSJDJDN5663VDHSDN';

        if (currentSubactividadId && tempSeleccion !== null) {
            // Encuentra el índice de la actividad y de la subactividad desde el ID
            const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);

            // Prepara la evaluación de la subactividad seleccionada
            const evaluacionSubactividad = {

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
                        resultadoInspeccion: subactividad.resultadoInspeccion || '',
                        formularioEnviado: subactividad.formularioEnviado || '',
                        idRegistroFormulario: subactividad.idRegistroFormulario || ''
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

    const [resultadoInspeccion, setResultadoInspeccion] = useState("");

    // Define la fecha, el responsable y genera la firma aquí
    const fechaHoraActual = new Date().toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const nombreResponsable = "Enrique Perez"; // Asumiendo que tienes una forma de obtener el nombre del usuario

    const firma = '9c8245e6e0b74cfccg97e8714u3234228fb4xcd2'

    const marcarFormularioComoEnviado = async (idRegistroFormulario, resultadoInspeccion,) => {
        if (!ppi || !currentSubactividadId) {
            console.error("PPI o subactividad no definida.");
            return;
        }

        // Divide el ID para obtener índices de actividad y subactividad
        const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);

        // Crea una copia del estado actual del PPI para modificarlo
        let nuevoPpi = { ...ppi };
        let subactividadSeleccionada = nuevoPpi.actividades[actividadIndex].subactividades[subactividadIndex];

        // Actualiza los campos con los datos necesarios
        subactividadSeleccionada.formularioEnviado = true;
        subactividadSeleccionada.idRegistroFormulario = idRegistroFormulario;
        subactividadSeleccionada.resultadoInspeccion = resultadoInspeccion;
        subactividadSeleccionada.fecha = fechaHoraActual;
        subactividadSeleccionada.responsable = nombreResponsable;
        subactividadSeleccionada.firma = firma;
        subactividadSeleccionada.comentario = comentario;

        // Si la inspección es "Apto", incrementa el contador de actividadesAptas en el lote
        if (resultadoInspeccion === "Apto") {
            const loteRef = doc(db, "lotes", idLote);
            await updateDoc(loteRef, {
                actividadesAptas: increment(1)
            });
        }

        // Si la inspección es No Apto, duplica la subactividad para una futura inspección
        if (resultadoInspeccion === "No apto") {
            let nuevaSubactividad = { ...subactividadSeleccionada };

            // Eliminar o reiniciar propiedades específicas de la evaluación para la nueva subactividad
            delete nuevaSubactividad.resultadoInspeccion;
            delete nuevaSubactividad.enviado;
            delete nuevaSubactividad.idRegistroFormulario;

            // Restablecer los valores de Responsable, Fecha, Comentarios e Inspección
            // Aquí asumimos que quieres restablecerlos a valores vacíos o predeterminados
            nuevaSubactividad.responsable = '';
            nuevaSubactividad.fecha = '';
            nuevaSubactividad.comentario = '';
            // Para el campo Inspección, asegúrate de restablecerlo según cómo lo manejas en tu modelo de datos
            // Si Inspección se maneja con otro campo o de otra forma, ajusta esta línea acorde a tu implementación
            // Por ejemplo, si 'inspeccion' es un campo booleano que indica si se ha realizado una inspección
            nuevaSubactividad.formularioEnviado = false; // Ajusta el nombre del campo y el valor según tu caso


            // Incrementa el número de versión de la nueva subactividad
            if (nuevaSubactividad.version) {
                nuevaSubactividad.version = String(parseInt(nuevaSubactividad.version) + 1);
            } else {
                // Si por alguna razón la subactividad original no tiene número de versión, se inicializa a 1
                nuevaSubactividad.version = "1";
            }

            // Inserta la nueva subactividad en el PPI
            nuevoPpi.actividades[actividadIndex].subactividades.splice(subactividadIndex + 1, 0, nuevaSubactividad);
        }


        // Actualiza la subactividad en el array
        nuevoPpi.actividades[actividadIndex].subactividades[subactividadIndex] = subactividadSeleccionada;

        // Llama a la función que actualiza los datos en Firestore
        await actualizarFormularioEnFirestore(nuevoPpi);
    };






    const actualizarFormularioEnFirestore = async (nuevoPpi) => {
        if (!nuevoPpi.docId) {
            console.error("No se proporcionó docId para la actualización.");
            return;
        }

        try {
            // Aquí, "docId" es el ID del documento de Firestore donde se almacenan los datos del PPI.
            const ppiRef = doc(db, "lotes", idLote, "inspecciones", nuevoPpi.docId);

            // Prepara los datos que se van a actualizar. En este caso, actualizamos todo el objeto de PPI.
            const updatedData = {
                actividades: nuevoPpi.actividades.map(actividad => ({
                    ...actividad,
                    subactividades: actividad.subactividades.map(subactividad => ({
                        ...subactividad,

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
                    <h1 className='font-medium text-amber-600'>Ppi: {ppiNombre}</h1>
                </Link>

            </div>

            <div className='flex gap-3 flex-col mt-5 bg-white p-8 rounded-xl shadow-md'>
                <div className="w-full rounded-xl overflow-x-auto">
                    <div>
                        <div className="w-full bg-gray-300 text-gray-600 text-sm font-medium py-3 px-3 grid grid-cols-24">
                            <div className='col-span-1'>Versión</div>
                            <div className='col-span-1'>Nº</div>

                            <div className="col-span-3">Actividad</div>
                            <div className="col-span-4">Criterio de aceptación</div>
                            <div className="col-span-2 text-center">Documentación de referencia</div>
                            <div className="col-span-2 text-center">Tipo de inspección</div>
                            <div className="col-span-1 text-center">Punto</div>
                            <div className="col-span-2 text-center">Responsable</div>
                            <div className="col-span-2 text-center">Fecha</div>
                            <div className="col-span-3 text-center">Comentarios</div>
                            {/* <div className="col-span-2 text-center">Estatus</div> */}
                            <div className="col-span-1 text-center">Inspección</div>
                            <div className="col-span-2 text-center">Resultado</div>

                        </div>


                        <div>
                            {ppi && ppi.actividades.map((actividad, indexActividad) => [
                                // Row for activity name
                                <div key={`actividad-${indexActividad}`} className="bg-gray-200 grid grid-cols-24 items-center px-3 py-3 border-b border-gray-200 text-sm font-medium">
                                    <div className="col-span-1">

                                        (V)

                                    </div>
                                    <div className="col-span-1">

                                        {actividad.numero}

                                    </div>
                                    <div className="col-span-22">

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
                                        <div className="col-span-1 px-3 py-5 ">
                                            V-{subactividad.version}  {/* Combina el número de actividad y el índice de subactividad */}
                                        </div>
                                        <div className="col-span-1 px-3 py-5 ">
                                            {subactividad.numero} {/* Combina el número de actividad y el índice de subactividad */}
                                        </div>

                                        <div className="col-span-3 px-3 py-5">
                                            {subactividad.nombre}
                                        </div>

                                        <div className="col-span-4 px-3 py-5">
                                            {subactividad.criterio_aceptacion}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.documentacion_referencia}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.tipo_inspeccion}
                                        </div>
                                        <div className="col-span-1 px-3 py-5 text-center">
                                            {subactividad.punto}
                                        </div>




                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.responsable || ''}
                                        </div>
                                        <div className="col-span-2 px-5 py-5 text-center">
                                            {/* Aquí asumo que quieres mostrar la fecha en esta columna, ajusta según sea necesario */}
                                            {subactividad.fecha || ''}
                                        </div>
                                        <div className="col-span-3 px-5 py-5 text-center">
                                            {subactividad.comentario || ''}
                                        </div>
                                        {/* <div className={`col-span-2 px-5 py-5 text-center`}>
                                            {
                                                subactividad.resultadoInspeccion === "Apto" ? (
                                                    <span className='text-teal-500 font-bold text-3xl flex justify-center'><IoCheckmarkCircle /></span>
                                                ) : subactividad.resultadoInspeccion === "No apto" ? (
                                                    <div><span className='text-red-500 font-bold text-3xl flex justify-center'><IoMdCloseCircle /></span><p className='text-red-500 font-bold'>Repetir</p></div>
                                                ) : (
                                                    <span className='text-yellow-500 font-bold text-2xl flex justify-center'><FaClock /></span>
                                                )
                                            }
                                        </div> */}


                                        <div className="col-span-1 px-5 py-5 bg-white flex justify-center">
                                            {subactividad.formularioEnviado ? (
                                                // Si la subactividad ya fue enviada, muestra "Enviado"
                                                <span className="font-bold text-gray-500">Enviado</span>
                                            ) : (
                                                // Si la subactividad aún no ha sido enviada, muestra un ícono para abrir el formulario de inspección
                                                <span
                                                    className="text-gray-500 text-3xl font-bold cursor-pointer"
                                                    onClick={() => handleOpenModalFormulario(`apto-${indexActividad}-${indexSubactividad}`)}>
                                                    <IoMdAddCircle />
                                                </span>
                                            )}
                                        </div>


                                        <div className="col-span-2 px-5 py-5 bg-white flex justify-center">
                                            {subactividad.formularioEnviado ? (
                                                subactividad.resultadoInspeccion === "Apto" ? (
                                                    <span
                                                        onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                        className="w-full font-bold text-medium p-2 rounded text-white text-center bg-teal-600 cursor-pointer">
                                                        Apto

                                                    </span>
                                                ) : subactividad.resultadoInspeccion === "No apto" ? (
                                                    <span
                                                        onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                        className="w-full font-bold text-medium p-2 rounded text-white w-full text-center bg-red-600 cursor-pointer">
                                                        No apto
                                                    </span>
                                                ) : (
                                                    <span
                                                        onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                        className="w-full font-bold text-medium p-2 rounded text-white w-full text-center bg-yellow-500 cursor-pointer">
                                                        Pendiente
                                                    </span>
                                                )
                                            ) : (
                                                <span
                                                    onClick={() => handleOpenModal(`apto-${indexActividad}-${indexSubactividad}`)}
                                                    className="w-full font-bold text-medium p-2 rounded text-white w-full text-center bg-yellow-500 cursor-pointer">
                                                    Pendiente
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
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                    <div className="mx-auto w-[700px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8"
                    >
                        <button onClick={handleCloseModal} className="text-3xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>



                        <h2 className='font-medium text-xl my-4'>¿Quieres guardar y firmar la inspeccin</h2>
                        <p className='font-normal my-4 flex items-center gap-2'>
                            <p className='text-red-600 text-lg'><IoWarningOutline /></p>
                            Al guardar el resultado de la inspección<strong className='font-medium'>no se puede modificar</strong></p>

                        {/* <div className='mt-5 flex flex-col gap-2'>
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
                        </div> */}




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

            {modalFormulario && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                    <div className="mx-auto w-[700px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300">
                            <IoCloseCircle />
                        </button>

                        <div className="my-6">
                            <label htmlFor="resultadoInspeccion" className="block text-xl font-bold text-gray-500 mb-4">
                                Resultado de la inspección:
                            </label>
                            <select
                                id="resultadoInspeccion"
                                value={resultadoInspeccion}
                                onChange={(e) => setResultadoInspeccion(e.target.value)}
                                className="block w-full py-2 text-base border p-2 border-gray-300 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                            >
                                <option value="">Selecciona una opción del desplegable...</option>
                                <option value="Apto">Apto</option>
                                <option value="No apto">No apto</option>
                            </select>
                        </div>


                        <p className=' my-6'><strong>Fecha: </strong>{fechaHoraActual}</p>

                        <FormularioInspeccion
                            setModalFormulario={setModalFormulario}
                            modalFormulario={modalFormulario}
                            currentSubactividadId={currentSubactividadId}
                            ppiSelected={ppi}
                            marcarFormularioComoEnviado={marcarFormularioComoEnviado}
                            actualizarFormularioEnFirestore={actualizarFormularioEnFirestore}
                            resultadoInspeccion={resultadoInspeccion}
                            comentario={comentario}
                            setComentario={setComentario}
                            firma={firma}

                            fechaHoraActual={fechaHoraActual}
                            handleCloseModal={handleCloseModal}
                            ppiNombre={ppiNombre}
                            nombreResponsable={nombreResponsable}

                            setResultadoInspeccion={setResultadoInspeccion}

                        />





                    </div>

                </div>
            )}




        </div>


    );
}

export default TablaPpi;
