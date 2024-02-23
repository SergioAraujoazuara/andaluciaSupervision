import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../firebase_config';

function AgregarPPi() {
    const { id } = useParams();
    const [nombre, setNombre] = useState('');
    const [actividades, setActividades] = useState([
        {
            numero: '',
            actividad: '',
            subactividades: [
                {
                    numero: '',
                    nombre: '',
                    criterio_aceptacion: '',
                    documentacion_referencia: '',
                    tipo_inspeccion: '',
                    punto: '',
                    responsable: '',
                    fecha: '',
                    firma: ''
                }
            ]
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleActividadChange = (index, e) => {
        const newActividades = [...actividades];
        newActividades[index][e.target.name] = e.target.value;
        setActividades(newActividades);
    };

    const handleSubactividadChange = (actividadIndex, subactividadIndex, e) => {
        const newActividades = [...actividades];
        newActividades[actividadIndex].subactividades[subactividadIndex][e.target.name] = e.target.value;
        setActividades(newActividades);
    };

    const addSubactividad = (actividadIndex) => {
        const newActividades = [...actividades];
        newActividades[actividadIndex].subactividades.push({
            numero: '',
            nombre: '',
            criterio_aceptacion: '',
            documentacion_referencia: '',
            tipo_inspeccion: '',
            punto: '',
            responsable: '',
            fecha: '',
            firma: ''
        });
        setActividades(newActividades);
    };

    const handleAgregarPPi = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'ppis'), {
                nombre,
                idLote: id,
                actividades
            });

            setNombre('');
            setActividades([]);
            alert('El PPI se agregó correctamente.');
        } catch (err) {
            console.error('Error al agregar el PPI:', err);
            setError('Hubo un error al agregar el PPI. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4">Agregar PPI</h1>
            <form onSubmit={handleAgregarPPi}>
                <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre:</label>
                    <input 
                        type="text" 
                        id="nombre" 
                        value={nombre} 
                        onChange={e => setNombre(e.target.value)} 
                        required 
                        className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                
                {actividades.map((actividad, i) => (
                    <div key={i} className="mb-4 border rounded-md p-4">
                        <input 
                            name="numero"
                            placeholder="Número de actividad"
                            value={actividad.numero} 
                            onChange={e => handleActividadChange(i, e)} 
                            required 
                            className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <input 
                            name="actividad"
                            placeholder="Nombre de actividad"
                            value={actividad.actividad} 
                            onChange={e => handleActividadChange(i, e)} 
                            required 
                            className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {actividad.subactividades && actividad.subactividades.map((sub, j) => (
                            <div key={j} className="mt-4 border rounded-md p-4">
                                <input 
                                    name="numero"
                                    placeholder="Número de subactividad"
                                    value={sub.numero} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="nombre"
                                    placeholder="Descripción"
                                    value={sub.nombre} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="criterio_aceptacion"
                                    placeholder="Criterio de aceptación"
                                    value={sub.criterio_aceptacion} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="documentacion_referencia"
                                    placeholder="Documentación de referencia"
                                    value={sub.documentacion_referencia} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="tipo_inspeccion"
                                    placeholder="Tipo de inspección"
                                    value={sub.tipo_inspeccion} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="punto"
                                    placeholder="Punto"
                                    value={sub.punto} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="responsable"
                                    placeholder="Responsable"
                                    value={sub.responsable} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="fecha"
                                    placeholder="Fecha"
                                    type="date"
                                    value={sub.fecha} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <input 
                                    name="firma"
                                    placeholder="Firma"
                                    value={sub.firma} 
                                    onChange={e => handleSubactividadChange(i, j, e)} 
                                    required 
                                    className="mt-1 p-2 block w-full border rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        ))}
                        <button type="button" onClick={() => addSubactividad(i)} className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Añadir Subactividad
                        </button>
                    </div>
                ))}
                <button type="submit" disabled={loading} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {loading ? 'Cargando...' : 'Agregar PPI'}
                </button>
                {error && <p className="mt-4 text-red-500">{error}</p>}
            </form>
        </div>
    );
}

export default AgregarPPi;
