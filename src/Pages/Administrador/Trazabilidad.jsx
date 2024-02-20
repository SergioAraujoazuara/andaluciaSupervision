import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { TbBuildingFactory } from "react-icons/tb";

function Trazabilidad() {
    const { id } = useParams();

    // Variables de estado
    const [proyecto, setProyecto] = useState({});
    const [sectores, setSectores] = useState([]);

    // Inputs
    const [sectorInput, setSectorInput] = useState('');
    const [selectedSector, setSelectedSector] = useState('');
    const [subSectorInput, setSubSectorInput] = useState('');
    const [selectedSubSector, setSelectedSubSector] = useState('');
    const [parteInput, setParteInput] = useState('');

    useEffect(() => {
        obtenerProyecto();
        obtenerSectores();
    }, []);

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

    // Obtener sectores
    const obtenerSectores = async () => {
        try {
            const sectoresCollectionRef = collection(db, `proyectos/${id}/sector`);
            const sectoresSnapshot = await getDocs(sectoresCollectionRef);
            const sectoresData = await Promise.all(sectoresSnapshot.docs.map(async doc => {
                const sectorData = { id: doc.id, ...doc.data() };
                sectorData.subsectores = await obtenerSubsectores(doc.id); // Obtener subsectores asociados a este sector
                return sectorData;
            }));
            setSectores(sectoresData);
        } catch (error) {
            console.error('Error al obtener los sectores:', error);
        }
    };

    // Obtener subsectores
    const obtenerSubsectores = async (sectorId) => {
        try {
            const subsectorCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector`);
            const subsectoresSnapshot = await getDocs(subsectorCollectionRef);
            const subsectoresData = await Promise.all(subsectoresSnapshot.docs.map(async doc => {
                const subsectorData = { id: doc.id, ...doc.data() };
                subsectorData.partes = await obtenerPartes(sectorId, doc.id); // Obtener partes asociadas a este subsector
                return subsectorData;
            }));
            return subsectoresData;
        } catch (error) {
            console.error('Error al obtener los subsectores:', error);
        }
    };

    // Obtener partes de un subsector específico
    const obtenerPartes = async (sectorId, subSectorId) => {
        try {
            const parteCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subSectorId}/parte`);
            const parteSnapshot = await getDocs(parteCollectionRef);
            return parteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error al obtener las partes:', error);
        }
    };

    // Función para agregar un sector con validación de nombre
    const agregarSector = async () => {
        try {
            const nombreSectorNormalizado = sectorInput.toLowerCase().trim();

            const sectoresCollectionRef = collection(db, `proyectos/${id}/sector`);
            const nombresSectores = await getNombresSectores(sectoresCollectionRef);

            if (nombresSectores.includes(nombreSectorNormalizado)) {
                console.log('El nombre del sector ya existe en la base de datos.');
            } else {
                const batch = writeBatch(db);
                const nuevoSectorRef = doc(sectoresCollectionRef);
                batch.set(nuevoSectorRef, { nombre: sectorInput });
                await batch.commit();
                console.log('Sector agregado correctamente.');
                setSectorInput('');
                obtenerSectores();
            }
        } catch (error) {
            console.error('Error al agregar el sector:', error);
        }
    };

    // Función para obtener los nombres de los sectores
    const getNombresSectores = async (sectoresCollectionRef) => {
        const sectoresSnapshot = await getDocs(sectoresCollectionRef);
        return sectoresSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());
    };

    // Función para manejar el cambio de selección en el desplegable de sector
    const handleSectorChange = async (event) => {
        const selectedSectorId = event.target.value;
        setSelectedSector(selectedSectorId);
    };

    // Función para agregar un subsector con validación de nombre
    const agregarSubsector = async (sectorId) => {
        try {
            const nombreSubsectorNormalizado = subSectorInput.toLowerCase().trim();

            const subsectoresCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector`);
            const nombresSubsectores = await getNombresSubsectores(subsectoresCollectionRef);

            if (nombresSubsectores.includes(nombreSubsectorNormalizado)) {
                console.log('El nombre del subsector ya existe en el sector específico.');
            } else {
                const batch = writeBatch(db);
                const nuevoSubsectorRef = doc(subsectoresCollectionRef);
                batch.set(nuevoSubsectorRef, { nombre: subSectorInput });
                await batch.commit();
                console.log('Subsector agregado correctamente.');
                setSubSectorInput('');

                const nuevosSubsectores = await obtenerSubsectores(sectorId);
                const sectoresActualizados = sectores.map(sector => {
                    if (sector.id === sectorId) {
                        sector.subsectores = nuevosSubsectores;
                    }
                    return sector;
                });
                setSectores(sectoresActualizados);
            }
        } catch (error) {
            console.error('Error al agregar el subsector:', error);
        }
    };

    // Función para obtener los nombres de los subsectores
    const getNombresSubsectores = async (subsectoresCollectionRef) => {
        const subsectoresSnapshot = await getDocs(subsectoresCollectionRef);
        return subsectoresSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());
    };

    // Función para manejar el cambio de selección en el desplegable de subsector
    const handleSubSectorChange = (event) => {
        setSelectedSubSector(event.target.value);
    };

    // Función para agregar una parte a la subcolección de un subsector específico
    const agregarParte = async (subSectorId) => {
        try {
            const partesCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${subSectorId}/parte`);
            const batch = writeBatch(db);
            const nuevaParteRef = doc(partesCollectionRef);
            batch.set(nuevaParteRef, { nombre: parteInput });
            await batch.commit();
            console.log('Parte agregada correctamente.');
            setParteInput('');

            const nuevosSubsectores = await obtenerSubsectores(selectedSector);
            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === selectedSector) {
                    sector.subsectores = nuevosSubsectores;
                }
                return sector;
            });
            setSectores(sectoresActualizados);
        } catch (error) {
            console.error('Error al agregar la parte:', error);
        }
    };

    // Función para manejar el evento cuando se hace clic en el botón para agregar una parte
    const handleAgregarParte = () => {
        if (selectedSubSector) {
            agregarParte(selectedSubSector);
        } else {
            console.error('No se ha seleccionado ningún subsector.');
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

                        <div className="flex flex-col items-start gap-3">
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

                        <div className="flex flex-col items-start gap-3">
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
                                    onClick={() => agregarSubsector(selectedSector)}
                                    className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    <IoMdAddCircle />
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <label htmlFor="subsectores">Seleccionar Subsector: </label>
                                <select
                                    id="subsectores"
                                    className="border px-3 py-1 rounded-lg"
                                    value={selectedSubSector}
                                    onChange={handleSubSectorChange}
                                >
                                    <option value="">Seleccione un subsector</option>
                                    {(sectores.find(sector => sector.id === selectedSector)?.subsectores || []).map((subsector) => (
                                        <option key={subsector.id} value={subsector.id}>{subsector.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3">
                            <div className="flex items-center gap-3">
                                <label htmlFor="parte">Parte: </label>
                                <input
                                    type="text"
                                    id="parte"
                                    className='border px-3 py-1 rounded-lg'
                                    value={parteInput}
                                    onChange={(e) => setParteInput(e.target.value)}
                                />
                                <button
                                    onClick={handleAgregarParte}
                                    className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    <IoMdAddCircle />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="container mx-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsector</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parte</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            {sectores.map((sector) => (
                                <React.Fragment key={sector.id}>
                                    {sector.subsectores.map((subsector) => (
                                        <React.Fragment key={subsector.id}>
                                            <tr>
                                                <td class="px-6 py-4 whitespace-nowrap" rowSpan={subsector.partes.length}>
                                                    <div class="flex items-center">
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900">{sector.nombre}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="text-sm text-gray-900">{subsector.nombre}</div>
                                                </td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <ul>
                                                        {subsector.partes.map((parte, index) => (
                                                            <li key={parte.id} class={`text-sm text-gray-900 ${index === 0 ? '' : 'mt-2'}`}>{parte.nombre}</li>
                                                        ))}
                                                    </ul>
                                                </td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Trazabilidad;
