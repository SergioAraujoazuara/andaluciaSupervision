// import React from 'react'
// import logo from '../assets/logo_solo.png';
// import { FaArrowRight } from "react-icons/fa";
// import { GoHomeFill } from "react-icons/go";
// import { Link } from 'react-router-dom';

// function Elemento() {
//     const nombre_proyecto = localStorage.getItem('nombre_proyecto')
//     return (
//         <div className='min-h-screen px-14 py-5'>

//             <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
//                 <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
//                 <Link to={'/'}>
//                     <h1 className=' text-gray-500'>Inicio</h1>
//                 </Link>
                
//                 <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
//                 <Link to={'#'}>
//                     <h1 className='font-medium text-amber-600'>Elementos</h1>
//                 </Link>

               
//             </div>

//             <div>
//                 <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

            


//                     <div class="w-full rounded rounded-xl">
//                         <div className='grid sm:grid-cols-10 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
//                             <div className='text-left font-medium text-gray-600 sm:block hidden sm:col-span-2'>Capítulo</div>
//                             <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-4'>Elemento</div>
//                             <div className='text-left sm:ps-10 font-medium text-gray-600 sm:block hidden sm:col-span-4'>PPI</div>
//                         </div>

//                         <Link to={'/tablaPpi'}>
//                             <div className='cursor-pointer grid sm:grid-cols-10 grid-cols-1 items-center justify-start sm:p-5 border-b-2 font-normal text-gray-600'>
//                                 <div className='sm:border-r-2 sm:border-b-0 flex items-center sm:col-span-2'>
//                                 Viaducto de Kortazar	
//                                 </div>

//                                  <div className='sm:border-r-2 sm:border-b-0 flex items-center sm:col-span-3 sm:ps-10'>
//                              	Zapata
//                                 </div>

//                                 <div className='h-10 flex items-center sm:justify-start sm:col-span-5 sm:ps-10'>
//                                 0302 Elementos estructurales de hormigón
//                                 </div>



//                             </div>
//                         </Link>

//                     </div>

//                 </div>





//             </div>

//         </div>
//     )
// }

// export default Elemento

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_config'; // Ajusta esta importación según tu configuración

function Elemento() {
    const { id } = useParams(); // ID del proyecto
    const [sectores, setSectores] = useState([]);
    const [sectorSeleccionado, setSectorSeleccionado] = useState('');
    const [subsectores, setSubsectores] = useState([]);
    const [subsectorSeleccionado, setSubsectorSeleccionado] = useState('');
    const [partes, setPartes] = useState([]);
    const [parteSeleccionada, setParteSeleccionada] = useState('');
    const [elementos, setElementos] = useState([]);
    const [elementoSeleccionado, setElementoSeleccionado] = useState('');
    const [lotes, setLotes] = useState([]);

    useEffect(() => {
        if (id) {
            obtenerSectores();
        }
    }, [id]);

    const obtenerSectores = async () => {
        const querySnapshot = await getDocs(collection(db, `proyectos/${id}/sector`));
        const sectoresData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSectores(sectoresData);
    };

    const handleSectorChange = async (event) => {
        const sectorId = event.target.value;
        setSectorSeleccionado(sectorId);
        setSubsectores([]);
        setSubsectorSeleccionado('');
        setPartes([]);
        setParteSeleccionada('');
        setElementos([]);
        setElementoSeleccionado('');
        setLotes([]);
        if (sectorId) {
            obtenerSubsectores(sectorId);
        }
    };

    const obtenerSubsectores = async (sectorId) => {
        const querySnapshot = await getDocs(collection(db, `proyectos/${id}/sector/${sectorId}/subsector`));
        const subsectoresData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setSubsectores(subsectoresData);
    };

    const handleSubsectorChange = async (event) => {
        const subsectorId = event.target.value;
        setSubsectorSeleccionado(subsectorId);
        setPartes([]);
        setParteSeleccionada('');
        setElementos([]);
        setElementoSeleccionado('');
        setLotes([]);
        if (subsectorId) {
            obtenerPartes(sectorSeleccionado, subsectorId);
        }
    };

    const obtenerPartes = async (sectorId, subsectorId) => {
        const querySnapshot = await getDocs(collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subsectorId}/parte`));
        const partesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setPartes(partesData);
    };

    const handleParteChange = async (event) => {
        const parteId = event.target.value;
        setParteSeleccionada(parteId);
        setElementos([]);
        setElementoSeleccionado('');
        setLotes([]);
        if (parteId) {
            obtenerElementos(sectorSeleccionado, subsectorSeleccionado, parteId);
        }
    };

    const obtenerElementos = async (sectorId, subsectorId, parteId) => {
        const querySnapshot = await getDocs(collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subsectorId}/parte/${parteId}/elemento`));
        const elementosData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setElementos(elementosData);
    };

    const handleElementoChange = async (event) => {
        const elementoId = event.target.value;
        setElementoSeleccionado(elementoId);
        setLotes([]);
        if (elementoId) {
            obtenerLotes(sectorSeleccionado, subsectorSeleccionado, parteSeleccionada, elementoId);
        }
    };

    const obtenerLotes = async (sectorId, subsectorId, parteId, elementoId) => {
        const querySnapshot = await getDocs(collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subsectorId}/parte/${parteId}/elemento/${elementoId}/lote`));
        const lotesData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        setLotes(lotesData);
    };

    return (
        <div className='min-h-screen px-14 py-5'>
            <div>
                <label>Sector:</label>
                <select value={sectorSeleccionado} onChange={handleSectorChange}>
                    <option value="">Selecciona un sector</option>
                    {sectores.map((sector) => (
                        <option key={sector.id} value={sector.id}>{sector.nombre}</option>
                    ))}
                </select>
            </div>

            {subsectores.length > 0 && (
                <div>
                    <label>Subsector:</label>
                    <select value={subsectorSeleccionado} onChange={handleSubsectorChange}>
                        <option value="">Selecciona un subsector</option>
                        {subsectores.map((subsector) => (
                            <option key={subsector.id} value={subsector.id}>{subsector.nombre}</option>
                        ))}
                    </select>
                </div>
            )}

            {partes.length > 0 && (
                <div>
                    <label>Parte:</label>
                    <select value={parteSeleccionada} onChange={handleParteChange}>
                        <option value="">Selecciona una parte</option>
                        {partes.map((parte) => (
                            <option key={parte.id} value={parte.id}>{parte.nombre}</option>
                        ))}
                    </select>
                </div>
            )}

            {elementos.length > 0 && (
                <div>
                    <label>Elemento:</label>
                    <select value={elementoSeleccionado} onChange={handleElementoChange}>
                        <option value="">Selecciona un elemento</option>
                        {elementos.map((elemento) => (
                            <option key={elemento.id} value={elemento.id}>{elemento.nombre}</option>
                        ))}
                    </select>
                </div>
            )}

            {lotes.length > 0 && (
                <div>
                    <label>Lotes:</label>
                    <ul>
                        {lotes.map((lote) => (
                            <li key={lote.id}>{lote.nombre}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Elemento;
