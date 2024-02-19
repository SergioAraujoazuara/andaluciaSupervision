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
    const [sectores, setSectores] = useState([]);
    const [subSectores, setSubSectores] = useState([]);

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
            const sectoresData = [];

            for (const doc of sectoresSnapshot.docs) {
                const sectorData = { id: doc.id, ...doc.data() };
                sectorData.subsectores = await obtenerSubsectores(doc.id);
                sectoresData.push(sectorData);
            }

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
            const subsectoresData = [];

            for (const doc of subsectoresSnapshot.docs) {
                const subsectorData = { id: doc.id, ...doc.data() };
                subsectorData.partes = await obtenerPartes(sectorId, doc.id);
                subsectoresData.push(subsectorData);
            }

            return subsectoresData;
        } catch (error) {
            console.error('Error al obtener los subsectores:', error);
        }
    };

    // Obtener partes
    const obtenerPartes = async (sectorId, subSectorId) => {
        try {
            const parteCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subSectorId}/parte`);
            const parteSnapshot = await getDocs(parteCollectionRef);
            return parteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error al obtener las partes:', error);
        }
    };

    // Agregar sector
    const agregarSector = async () => {
        try {
            const nombreSectorNormalizado = sectorInput.toLowerCase().trim();
            const sectoresCollectionRef = collection(db, `proyectos/${id}/sector`);
            const sectoresSnapshot = await getDocs(sectoresCollectionRef);
            const nombresSectores = sectoresSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());

            if (nombresSectores.includes(nombreSectorNormalizado)) {
                console.log('El nombre del sector ya existe en la base de datos.');
            } else {
                await addDoc(sectoresCollectionRef, { nombre: sectorInput });
                console.log('Sector agregado correctamente.');
                setSectorInput('');
                const nuevoSector = { id: sectoresSnapshot.id, nombre: sectorInput, subsectores: [] };
                setSectores([...sectores, nuevoSector]);
            }
        } catch (error) {
            console.error('Error al agregar el sector:', error);
        }
    };

    // Agregar subsector
    const agregarSubsector = async (sectorId) => {
        try {
            const nombreSubsectorNormalizado = subSectorInput.toLowerCase().trim();
            const subsectoresCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector`);
            const subsectoresSnapshot = await getDocs(subsectoresCollectionRef);
            const nombresSubsectores = subsectoresSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());

            if (nombresSubsectores.includes(nombreSubsectorNormalizado)) {
                console.log('El nombre del subsector ya existe en el sector específico.');
            } else {
                await addDoc(subsectoresCollectionRef, { nombre: subSectorInput });
                console.log('Subsector agregado correctamente.');
                setSubSectorInput('');
                const nuevoSubsector = { id: subsectoresSnapshot.id, nombre: subSectorInput, partes: [] };
                const nuevosSubsectores = await obtenerSubsectores(sectorId);
                const sectorIndex = sectores.findIndex(sector => sector.id === sectorId);
                const sectoresActualizados = [...sectores];
                sectoresActualizados[sectorIndex].subsectores = nuevosSubsectores;
                setSectores(sectoresActualizados);
            }
        } catch (error) {
            console.error('Error al agregar el subsector:', error);
        }
    };

    // Agregar parte
    const agregarParte = async (subSectorId) => {
        try {
            const partesCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${subSectorId}/parte`);
            await addDoc(partesCollectionRef, { nombre: parteInput });
            console.log('Parte agregada correctamente.');
            setParteInput('');
            const nuevosSubsectores = await obtenerSubsectores(selectedSector);
            const sectorIndex = sectores.findIndex(sector => sector.id === selectedSector);
            const sectoresActualizados = [...sectores];
            sectoresActualizados[sectorIndex].subsectores = nuevosSubsectores;
            setSectores(sectoresActualizados);
        } catch (error) {
            console.error('Error al agregar la parte:', error);
        }
    };

    // Manejar cambio de selección en el desplegable de sector
    const handleSectorChange = async (event) => {
        const selectedSectorId = event.target.value;
        setSelectedSector(selectedSectorId);

        if (selectedSectorId) {
            const subsectores = await obtenerSubsectores(selectedSectorId);
            setSubSectores(subsectores);
        } else {
            setSubSectores([]);
        }
    };

    // Manejar cambio de selección en el desplegable de subsector
    const handleSubSectorChange = (event) => {
        setSelectedSubSector(event.target.value);
    };

    // Manejar evento de agregar subsector
    const handleAgregarSubsector = () => {
        if (selectedSector) {
            agregarSubsector(selectedSector);
        } else {
            console.error('No se ha seleccionado ningún sector.');
        }
    };

    // Manejar evento de agregar parte
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
                                    onClick={handleAgregarSubsector}
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
                                    {subSectores.map((subsector) => (
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

                {/* Tabla de trazabilidad */}
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
                                sector.subsectores.map((subsector) => (
                                    subsector.partes.map((parte) => (
                                        <tr key={parte.id}>
                                            <td class="px-6 py-4 whitespace-nowrap">{sector.nombre}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">{subsector.nombre}</td>
                                            <td class="px-6 py-4 whitespace-nowrap">{parte.nombre}</td>
                                        </tr>
                                    ))
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Trazabilidad;
