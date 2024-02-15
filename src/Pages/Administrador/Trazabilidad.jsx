import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { TbBuildingFactory } from "react-icons/tb";

function Trazabilidad() {
    const { id } = useParams();

    // Variables de estado
    const [proyecto, setProyecto] = useState({});
    // Sub colecciones
    const [sectores, setSectores] = useState([]);
    const [subSectores, setSubSectores] = useState([]);

    // Inputs
    const [sectorInput, setSectorInput] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [subSectorInput, setSubSectorInput] = useState('');
    const [selectedSubSector, setSelectedSubSector] = useState('');


    useEffect(() => {
        obtenerProyecto();
        obtenerSectores();
        obtenerSubsectores();
    }, []);

    // PROYECTOS /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Obtener información del proyecto
    const obtenerProyecto = async () => {
        try {
            const proyectoRef = doc(db, 'proyectos', id);
            const proyectoSnapshot = await getDoc(proyectoRef);

            if (proyectoSnapshot.exists()) {
                setProyecto({ id: proyectoSnapshot.id, ...proyectoSnapshot.data() });
            } else {
                console.log('No se encontró ningún proyecto con el ID:', id);
            }
        } catch (error) {
            console.error('Error al obtener el proyecto:', error);
        }
    };

    // SECTOR /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Obtener sectores
    const obtenerSectores = async () => {
        try {
            const sectoresCollectionRef = collection(db, `proyectos/${id}/sector`);
            const sectoresSnapshot = await getDocs(sectoresCollectionRef);
            const sectoresData = sectoresSnapshot.docs.map(async doc => {
                const sectorData = { id: doc.id, ...doc.data() };
                sectorData.subsectores = await obtenerSubsectores(doc.id); // Obtener subsectores asociados a este sector
                return sectorData;
            });
            const sectoresWithSubsectores = await Promise.all(sectoresData);
            setSectores(sectoresWithSubsectores);
        } catch (error) {
            console.error('Error al obtener los sectores:', error);
        }
    };



    // Función para agregar un sector
    const agregarSector = async () => {
        try {
            const sectorCollectionRef = collection(db, `proyectos/${id}/sector`);
            await addDoc(sectorCollectionRef, { nombre: sectorInput });
            console.log('Sector agregado correctamente.');
            setSectorInput(''); // Limpiar el input después de agregar el sector
            obtenerSectores(); // Actualizar la lista de sectores después de agregar uno nuevo
        } catch (error) {
            console.error('Error al agregar el sector:', error);
        }
    };


    // SELECCIONAR desplegables /////////////////////////////////////////////////////////////////////////////////////////////////////

  // Función para manejar el cambio de selección en el desplegable de sector
const handleSectorChange = async (event) => {
    const selectedSectorId = event.target.value;
    setSelectedSector(selectedSectorId);

    // Obtener los subsectores asociados al sector seleccionado
    if (selectedSectorId) {
        const subsectores = await obtenerSubsectores(selectedSectorId);
        setSubSectores(subsectores);
    } else {
        // Si no se selecciona ningún sector, limpiar la lista de subsectores
        setSubSectores([]);
    }
};

// Función para manejar el cambio de selección en el desplegable de subsector
const handleSubSectorChange = (event) => {
    setSelectedSubSector(event.target.value);
};



    // SUB SECTOR /////////////////////////////////////////////////////////////////////////////////////////////////////

    // Obtener sub sectores
    const obtenerSubsectores = async (sectorId) => {
        try {
            const subsectorCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector`);
            const subsectoresSnapshot = await getDocs(subsectorCollectionRef);
            const subsectoresData = subsectoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return subsectoresData;

        } catch (error) {
            console.error('Error al obtener los subsectores:', error);
        }
    };

    // Función para agregar un subsector a la subcolección de un sector específico
    const agregarSubsector = async (sectorId) => {
        try {
            const subsectorCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector`);
            await addDoc(subsectorCollectionRef, { nombre: subSectorInput });
            console.log('Subsector agregado correctamente.');
            setSubSectorInput(''); // Limpiar el input después de agregar el subsector

            // Actualizar la lista de subsectores para el sector actual
            const nuevosSubsectores = await obtenerSubsectores(sectorId);
            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorId) {
                    sector.subsectores = nuevosSubsectores;
                }
                return sector;
            });
            setSectores(sectoresActualizados);
        } catch (error) {
            console.error('Error al agregar el subsector:', error);
        }
    };


    // Manejar el evento cuando se hace clic en el botón para agregar un subsector
    const handleAgregarSubsector = () => {
        if (selectedSector) {
            agregarSubsector(selectedSector);
        } else {
            console.error('No se ha seleccionado ningún sector.');
        }
    };




    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>
            {/* Encabezado */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-ligth text-gray-500'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/admin'}>
                    <h1 className='text-gray-600'>Administración</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/viewProject'}>
                    <h1 className=' text-gray-600'>Ver proyectos</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Elementos y razabilidad </h1>
                </Link>
            </div>

            {/* Contenido */}
            <div className='flex gap-3 flex-col mt-5 bg-white p-8 rounded rounded-xl shadow-md'>
                {/* Datos del proyecto */}
                <div className='flex gap-5'>
                    <img src={proyecto.logo} alt="logo" className='sm:w-52' />
                    <div className='text-lg font-medium text-gray-500'>
                        <p>{proyecto.nombre_corto}</p>
                        <p>{proyecto.nombre_completo}</p>
                    </div>
                </div>

                <div className='w-full border border-b-2'></div>

                {/* Formulario de trazabilidad */}
                <div className="mt-4 flex flex-col gap-5">
                    <p className='text-lg font-medium text-gray-500 mb-3 flex items-center gap-2'><TbBuildingFactory /> Trazabilidad</p>

                    <div className='flex gap-10'>


                        <div className="flex flex-col items-center gap-3">

                            {/* Sector */}
                            <div className="flex items-center gap-3">
                                <label htmlFor="sector">Sector: </label>
                                <input
                                    type="text"
                                    className='border px-3 py-1 rounded-lg'
                                    value={sectorInput}
                                    onChange={(e) => setSectorInput(e.target.value)}

                                />
                                <button
                                    onClick={agregarSector}
                                    className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    <IoMdAddCircle />
                                </button>
                            </div>

                            {/* Desplegable de sectores */}
                            <div className="flex items-center gap-3">
                                <label htmlFor="sectores">Seleccionar sector: </label>
                                <select
                                    id="sectores"
                                    className="border px-3 py-1 rounded-lg"
                                    value={selectedSector}
                                    onChange={handleSectorChange}

                                >
                                    <option value="">Seleccione un sector</option>
                                    {sectores.map((sector) => (
                                        <option key={sector.id} value={sector.id}>{sector.nombre}</option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        <div className="flex flex-col items-center gap-3">


                            {/* Sub Sector */}
                            <div className="flex items-center gap-3">
                                <label htmlFor="subsector">Subsector: </label>
                                <input
                                    type="text"
                                    id="subsector"
                                    className='border px-3 py-1 rounded-lg'
                                    value={subSectorInput}
                                    onChange={(e) => setSubSectorInput(e.target.value)}

                                />
                                <button
                                    onClick={handleAgregarSubsector}
                                    className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    <IoMdAddCircle />
                                </button>
                            </div>

                              {/* Desplegable de subsectores */}
                              <div className="flex items-center gap-3">
                                <label htmlFor="subsectores">Seleccionar Subsector: </label>
                                <select
                                    id="subsectores"
                                    className="border px-3 py-1 rounded-lg"
                                    value={selectedSubSector}
                                    onChange={handleSubSectorChange}

                                >
                                    <option value="">Seleccione un sector</option>
                                    {subSectores.map((sectore) => (
                                        <option key={sectore.id} value={sectore.id}>{sectore.nombre}</option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    </div>


                </div>


                {/* Tabla de sectores y subsectores */}

                <table className="mt-4 w-full">

                    <thead>
                        <tr className='bg-gray-100 border'>
                            <th className="px-4 py-2 border text-left">Sector</th>
                            <th className="px-4 py-2 border text-left">Subsectores</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sectores.map((sector) => (
                            <tr key={sector.id}>
                                <td className="border px-4 py-2">{sector.nombre}</td>
                                <td className="border px-4 py-2">
                                    <ul>
                                        {sector.subsectores.map((subsector) => (
                                            <li key={subsector.id}>{subsector.nombre}</li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </div>
    );
}

export default Trazabilidad;
