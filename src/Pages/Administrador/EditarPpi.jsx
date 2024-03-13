import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { BsClipboardCheck } from "react-icons/bs";
import { GrDocumentTest } from "react-icons/gr";

function EditarPpi() {
    const { id } = useParams();
    const [ppi, setPpi] = useState(null);
    const [editPpi, setEditPpi] = useState({ actividades: [] });

    useEffect(() => {
        const obtenerPpi = async () => {
            try {
                const ppiDoc = doc(db, 'ppis', id);
                const ppiData = await getDoc(ppiDoc);

                if (ppiData.exists()) {
                    setPpi(ppiData.data());
                    console.log(ppiData.data());
                    setEditPpi(ppiData.data());
                } else {
                    console.log('No se encontró el PPI con el ID proporcionado.');
                }
            } catch (error) {
                console.error('Error al obtener el PPI:', error);
            }
        };

        obtenerPpi();
    }, [id]);

    const handleChange = (e, actividadIndex = null, subactividadIndex = null, campo) => {
        const { value } = e.target;

        setEditPpi(prevState => {
            const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy

            if (actividadIndex !== null) {
                if (subactividadIndex !== null) {
                    // Cambio en una subactividad
                    newState.actividades[actividadIndex].subactividades[subactividadIndex][campo] = value;
                } else {
                    // Cambio en una actividad
                    newState.actividades[actividadIndex][campo] = value;
                }
            } else {
                // Cambio en propiedades de nivel superior del PPI
                newState[campo] = value;
            }

            return newState;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'ppis', id), editPpi);
            console.log('PPI actualizado exitosamente.');
        } catch (error) {
            console.error('Error al actualizar el PPI:', error);
        }
    };

    if (!ppi) {
        return <div>Cargando...</div>;
    }

    return (

        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>
            {/* Navigation section */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'/admin'}>
                        <h1 className='text-gray-500 text-gray-500'>Administración</h1>
                    </Link>
                    <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                    <Link to={'/verPpis'}>
                        <h1 className='text-gray-500 text-gray-500'>Ver Ppis</h1>
                    </Link>
                    <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Editar PPI</h1>
                    </Link>

                </div>
          
                <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

                    <h2 className='flex items-center gap-1 text-base'><strong className='text-amber-500 text-2xl font-medium'>*</strong>Selecciona la celda en la tabla y edita los valores</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='col-span-12 mb-4 mt-4'>
                            <label className='font-medium'>Nombre Punto inspección (Ppi) : </label>
                            <input
                            className='p-2 border border-gray-300 rounded'
                                type="text"
                                value={editPpi.nombre || ''}
                                onChange={(e) => handleChange(e, null, null, 'nombre')}
                            />
                        </div>
                        <div className='w-full bg-gray-300 grid grid-cols-12 text-sm items-center font-medium'>
                            <div className="py-3 px-2 text-left col-span-1 ">Nº</div>
                            <div className="py-3 px-2 text-left whitespace-normal col-span-3 ">Actividad</div>
                            <div className="py-3 px-2 text-left whitespace-normal col-span-4">Criterio de aceptación</div>
                            <div className="py-3 px-2 text-left whitespace-normal col-span-1">Documentación de referencia</div>
                            <div className="py-3 px-2 text-left col-span-2">Tipo de inspección</div>
                            <div className="py-3 px-2 text-left col-span-1">Punto</div>
                        </div>


                        {/* Iterar sobre actividades para generar inputs */}
                        {editPpi.actividades.map((actividad, actividadIndex) => (
                            <div key={`actividad-${actividadIndex}`}>

                                <div className='w-full grid grid-cols-12 font-medium'>
                                    <div className='col-span-1'>
                                        <input
                                            className='w-full p-2 border border-gray-300 bg-gray-200'
                                            type="text"
                                            value={actividad.numero || ''}
                                            onChange={(e) => handleChange(e, actividadIndex, null, 'numero')}
                                        />
                                    </div>
                                    <div className='col-span-11'>
                                        <input
                                            className='w-full p-2 border border-gray-300 bg-gray-200 font-medium'
                                            type="text"
                                            value={actividad.actividad || ''}
                                            onChange={(e) => handleChange(e, actividadIndex, null, 'nombre')}
                                        />
                                    </div>
                                </div>



                                {/* Iterar sobre subactividades para generar inputs */}
                                {actividad.subactividades && actividad.subactividades.map((subactividad, subactividadIndex) => (
                                    <div key={`subactividad-${subactividadIndex}`}>
                                        <div className='w-full bg-gray-100 grid grid-cols-12 text-sm'>
                                            <div className='col-span-1'>
                                                <input
                                                    className='w-full p-2 border bg-gray-50'
                                                    type="text"
                                                    value={subactividad.numero || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'numero')}
                                                />
                                            </div>

                                            <div className='col-span-3'>
                                                <input
                                                    className='w-full p-2 border'
                                                    type="text"
                                                    value={subactividad.nombre || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'nombre')}
                                                />
                                            </div>


                                            <div className='col-span-4'>
                                                <input
                                                    className='w-full p-2 border'
                                                    type="text"
                                                    value={subactividad.criterio_aceptacion || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'criterio_aceptacion')}
                                                />
                                            </div>

                                            <div className='col-span-1'>
                                                <input
                                                    className='w-full p-2 border'
                                                    type="text"
                                                    value={subactividad.documentacion_referencia || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'documentacion_referencia')}
                                                />
                                            </div>

                                            <div className='col-span-2'>
                                                <input
                                                    className='w-full p-2 border'
                                                    type="text"
                                                    value={subactividad.tipo_inspeccion || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'tipo_inspeccion')}
                                                />
                                            </div>

                                            <div className='col-span-1'>
                                                <input
                                                    className='w-full p-2 border'
                                                    type="text"
                                                    value={subactividad.punto || ''}
                                                    onChange={(e) => handleChange(e, actividadIndex, subactividadIndex, 'punto')}
                                                />
                                            </div>

                                        </div>




                                    </div>
                                ))}
                            </div>
                        ))}

                        <button type="submit">Guardar cambios</button>
                    </form>


                </div>
           
        </div>
    );
}

export default EditarPpi;



