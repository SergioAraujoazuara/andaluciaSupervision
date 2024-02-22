import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { TbBuildingFactory } from "react-icons/tb";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";


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
    const [selectedParte, setSelectedParte] = useState('');
    const [elementoInput, setElementoInput] = useState('');
    const [selectedElemento, setSelectedElemento] = useState('');
    const [loteInput, setLoteInput] = useState('');

    //alertas 
    const [alerta, setAlerta] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);

    const handleCloseAlert = () => {
        setMostrarModal(false)
    }

    // Llamar elemetos de la base de datos
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



    const obtenerPartes = async (sectorId, subSectorId) => {
        try {
            const parteCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subSectorId}/parte`);
            const parteSnapshot = await getDocs(parteCollectionRef);
            const partesData = await Promise.all(parteSnapshot.docs.map(async doc => {
                const parteData = { id: doc.id, ...doc.data() };
                // Aquí se obtienen los elementos de cada parte
                parteData.elementos = await obtenerElementos(sectorId, subSectorId, doc.id);
                return parteData;
            }));
            return partesData;
        } catch (error) {
            console.error('Error al obtener las partes:', error);
        }
    };

   
    

    // Función para agregar un sector con validación de nombre
    const agregarSector = async () => {
        try {
            // Normalizar el nombre del sector (convertir a minúsculas y eliminar espacios en blanco)
            const nombreSectorNormalizado = sectorInput.toLowerCase().trim();

            // Obtener los nombres de los sectores existentes y normalizarlos
            const nombresSectoresNormalizados = sectores.map(sector => sector.nombre.toLowerCase().trim());

            // Verificar si el nombre del sector ya existe
            if (nombresSectoresNormalizados.includes(nombreSectorNormalizado)) {
                  //alerta
                  setAlerta('El nombre ya existe en la base de datos.');
                  setTipoAlerta('error')
                  setMostrarModal(true)
                
            } else {
                // Agregar el sector si no existe
                const batch = writeBatch(db);
                const nuevoSectorRef = doc(collection(db, `proyectos/${id}/sector`));
                batch.set(nuevoSectorRef, { nombre: sectorInput });
                await batch.commit();
                //alerta
                setAlerta('Agregado correctamente.');
                setTipoAlerta('success')
                setMostrarModal(true)
                // limpiar input
                setSectorInput('');
                // actualizar lista
                obtenerSectores();
            }
        } catch (error) {
            console.error('Error al agregar el sector:', error);
        }
    };


    // Función para manejar el cambio de selección en el desplegable de sector
    const handleSectorChange = async (event) => {
        const selectedSectorId = event.target.value;
        setSelectedSector(selectedSectorId);
    };

    // Función para agregar un subsector con validación de nombre
    const agregarSubsector = async (sectorId) => {
        try {
            // Normalizar el nombre del subsector
            const nombreSubsectorNormalizado = subSectorInput.toLowerCase().trim();

            // Obtener los nombres de los subsectores existentes del sector seleccionado y normalizarlos
            const subsectoresDelSector = sectores.find(sector => sector.id === sectorId)?.subsectores || [];
            const nombresSubsectoresNormalizados = subsectoresDelSector.map(subsector => subsector.nombre.toLowerCase().trim());

            // Verificar si el nombre del subsector ya existe en el sector seleccionado
            if (nombresSubsectoresNormalizados.includes(nombreSubsectorNormalizado)) {
                //alerta
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error')
                setMostrarModal(true)
              
            } else {
                // Agregar el subsector si no existe
                const batch = writeBatch(db);
                const nuevoSubsectorRef = doc(collection(db, `proyectos/${id}/sector/${sectorId}/subsector`));
                batch.set(nuevoSubsectorRef, { nombre: subSectorInput });
                await batch.commit();
                //alerta
                setAlerta('Agregado correctamente.');
                setTipoAlerta('success')
                setMostrarModal(true)
                // Limoiar input
                setSubSectorInput('');

                // Actualizar la lista de subsectores del sector
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

    // Función para manejar el cambio de selección en el desplegable de subsector
    const handleSubSectorChange = (event) => {
        setSelectedSubSector(event.target.value);
    };

    // Función para agregar una parte a la subcolección de un subsector específico
    const agregarParte = async (subSectorId) => {
        try {
            // Normalizar el nombre de la parte
            const nombreParteNormalizado = parteInput.toLowerCase().trim();

            // Obtener los nombres de las partes existentes del subsector seleccionado y normalizarlos
            const subsectorSeleccionado = sectores.flatMap(sector => sector.subsectores).find(subsector => subsector.id === subSectorId);
            const nombresPartesNormalizados = subsectorSeleccionado?.partes.map(parte => parte.nombre.toLowerCase().trim()) || [];

            // Verificar si el nombre de la parte ya existe en el subsector seleccionado
            if (nombresPartesNormalizados.includes(nombreParteNormalizado)) {
                   //alerta
                   setAlerta('El nombre ya existe en la base de datos.');
                   setTipoAlerta('error')
                   setMostrarModal(true)
            } else {
                // Agregar la parte si no existe
                const parteCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${subSectorId}/parte`);
                const batch = writeBatch(db);
                const nuevaParteRef = doc(parteCollectionRef);
                batch.set(nuevaParteRef, { nombre: parteInput });
                await batch.commit();
                //alerta
                setAlerta('Agregado correctamente.');
                setTipoAlerta('success')
                setMostrarModal(true)
                // Limoiar input
                setParteInput('');

                // Actualizar la lista de partes del subsector
                const nuevosSubsectores = await obtenerSubsectores(selectedSector);
                const sectoresActualizados = sectores.map(sector => {
                    if (sector.id === selectedSector) {
                        sector.subsectores = nuevosSubsectores;
                    }
                    return sector;
                });
                setSectores(sectoresActualizados);
            }
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

    // Función para manejar el cambio de selección en el desplegable de parte
    const handleParteChange = (event) => {
        setSelectedParte(event.target.value);
    };


    const agregarElemento = async (parteId) => {
        try {
            // Normalizar el nombre del elemento
            const nombreElementoNormalizado = elementoInput.toLowerCase().trim();

            // Obtener los elementos existentes para esta parte
            const elementoCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${parteId}/elemento`);
            const elementosSnapshot = await getDocs(elementoCollectionRef);
            const nombresElementosExistentes = elementosSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());

            // Verificar si el nombre del elemento ya existe
            if (nombresElementosExistentes.includes(nombreElementoNormalizado)) {
                   //alerta
                   setAlerta('El nombre ya existe en la base de datos.');
                   setTipoAlerta('error')
                   setMostrarModal(true)
            } else {
                // Agregar el elemento si no existe
                const nuevoElementoRef = doc(elementoCollectionRef);
                await setDoc(nuevoElementoRef, { nombre: elementoInput }); // Usando setDoc en lugar de writeBatch para simplificar
                // Aquí es donde necesitas actualizar el estado para incluir el nuevo elemento

                // Encuentra la parte en la estructura del estado y actualízala con el nuevo elemento
                const sectoresActualizados = sectores.map(sector => {
                    if (sector.id === selectedSector) {
                        return {
                            ...sector,
                            subsectores: sector.subsectores.map(subsector => {
                                if (subsector.id === selectedSubSector) {
                                    return {
                                        ...subsector,
                                        partes: subsector.partes.map(parte => {
                                            if (parte.id === parteId) {
                                                const nuevosElementos = parte.elementos ? [...parte.elementos, { id: nuevoElementoRef.id, nombre: elementoInput }] : [{ id: nuevoElementoRef.id, nombre: elementoInput }];
                                                return { ...parte, elementos: nuevosElementos };
                                            }
                                            return parte;
                                        })
                                    };
                                }
                                return subsector;
                            })
                        };
                    }
                    return sector;
                });

                setSectores(sectoresActualizados);
                setElementoInput('');
                setAlerta('Elemento agregado correctamente.');
                setTipoAlerta('success');
                setMostrarModal(true);
            }
        } catch (error) {
            console.error('Error al agregar el elemento:', error);
            setAlerta('Error al agregar el elemento.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
    };


    const agregarLote = async (elementoId) => {
        if (!elementoId || !selectedParte || !selectedSubSector || !selectedSector) {
            console.error('No se ha seleccionado correctamente el elemento, parte, subsector o sector.');
            setAlerta('Selecciona correctamente todos los campos requeridos.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }
    
        try {
            // Obtén la referencia de la colección donde se almacenarán los lotes
            const loteCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${selectedParte}/elemento/${elementoId}/lote`);
            // Verifica si el lote ya existe
            const loteSnapshot = await getDocs(loteCollectionRef);
            const existeLote = loteSnapshot.docs.some(doc => doc.data().nombre.toLowerCase().trim() === loteInput.toLowerCase().trim());
    
            if (existeLote) {
                // Si el lote ya existe, muestra una alerta y no procedas a agregarlo
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error');
                setMostrarModal(true);
            } else {
                // Si el lote no existe, procede a agregarlo
                const nuevoLoteRef = doc(loteCollectionRef);
                await setDoc(nuevoLoteRef, { nombre: loteInput });
    
                setLoteInput('');
                setAlerta('Lote agregado correctamente.');
                setTipoAlerta('success');
                setMostrarModal(true);
    
                // Actualiza el estado para reflejar el nuevo lote agregado
                const sectoresActualizados = sectores.map(sector => {
                    if (sector.id === selectedSector) {
                        return {
                            ...sector,
                            subsectores: sector.subsectores.map(subsector => {
                                if (subsector.id === selectedSubSector) {
                                    return {
                                        ...subsector,
                                        partes: subsector.partes.map(parte => {
                                            if (parte.id === selectedParte) {
                                                return {
                                                    ...parte,
                                                    elementos: parte.elementos.map(elemento => {
                                                        if (elemento.id === elementoId) {
                                                            const nuevosLotes = elemento.lotes ? [...elemento.lotes, { id: nuevoLoteRef.id, nombre: loteInput }] : [{ id: nuevoLoteRef.id, nombre: loteInput }];
                                                            return { ...elemento, lotes: nuevosLotes };
                                                        }
                                                        return elemento;
                                                    })
                                                };
                                            }
                                            return parte;
                                        })
                                    };
                                }
                                return subsector;
                            })
                        };
                    }
                    return sector;
                });
    
                setSectores(sectoresActualizados);
            }
        } catch (error) {
            console.error('Error al agregar el lote:', error);
            setAlerta('Error al agregar el lote.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
    };
    
    

    const obtenerLotes = async (sectorId, subSectorId, parteId, elementoId) => {
        try {
            const loteCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subSectorId}/parte/${parteId}/elemento/${elementoId}/lote`);
            const loteSnapshot = await getDocs(loteCollectionRef);
            return loteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
            return []; // Retorna un arreglo vacío en caso de error para evitar interrupciones
        }
    };

    const obtenerElementos = async (sectorId, subSectorId, parteId) => {
        try {
            const elementoCollectionRef = collection(db, `proyectos/${id}/sector/${sectorId}/subsector/${subSectorId}/parte/${parteId}/elemento`);
            const elementoSnapshot = await getDocs(elementoCollectionRef);
            const elementos = await Promise.all(elementoSnapshot.docs.map(async doc => {
                const elementoData = { id: doc.id, ...doc.data() };
                elementoData.lotes = await obtenerLotes(sectorId, subSectorId, parteId, doc.id);
                return elementoData;
            }));
            return elementos;
        } catch (error) {
            console.error('Error al obtener los elementos:', error);
            return []; // Retorna un arreglo vacío en caso de error para evitar interrupciones
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

                    <div className='grid grid-cols-3 gap-10'>

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

                            <div className="flex items-center gap-3">
                                <label htmlFor="partes">Seleccionar Parte: </label>
                                <select
                                    id="partes"
                                    className="border px-3 py-1 rounded-lg"
                                    value={selectedParte}
                                    onChange={handleParteChange}
                                >
                                    <option value="">Seleccione una parte</option>
                                    {(sectores.find(sector => sector.id === selectedSector)?.subsectores.find(subsector => subsector.id === selectedSubSector)?.partes || []).map((parte) => (
                                        <option key={parte.id} value={parte.id}>{parte.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col items-start gap-3">
                            <div className="flex items-center gap-3">
                                <label htmlFor="elemento">Elemento: </label>
                                <input
                                    type="text"
                                    id="elemento"
                                    className='border px-3 py-1 rounded-lg'
                                    value={elementoInput}
                                    onChange={(e) => setElementoInput(e.target.value)}
                                />
                                <button
                                    onClick={() => agregarElemento(selectedParte)} // Asegúrate de tener un estado selectedParte para manejar la parte seleccionada
                                    className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    <IoMdAddCircle />
                                </button>
                            </div>


                            <div className="flex items-center gap-3">
                                <label htmlFor="elementos">Seleccionar Elemento: </label>
                                <select
                                    id="elementos"
                                    className="border px-3 py-1 rounded-lg"
                                    value={selectedElemento}
                                    onChange={(e) => setSelectedElemento(e.target.value)}
                                >
                                    <option value="">Seleccione un elemento</option>
                                    {/* Asumiendo que tienes una manera de obtener los elementos del estado para el subsector y parte seleccionados */}
                                    {sectores.find(sector => sector.id === selectedSector)?.subsectores.find(subsector => subsector.id === selectedSubSector)?.partes.find(parte => parte.id === selectedParte)?.elementos.map((elemento) => (
                                        <option key={elemento.id} value={elemento.id}>{elemento.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label htmlFor="lote">Lote: </label>
                            <input
                                type="text"
                                id="lote"
                                className='border px-3 py-1 rounded-lg'
                                value={loteInput}
                                onChange={(e) => setLoteInput(e.target.value)}
                            />
                            <button
                                onClick={() => agregarLote(selectedElemento)} // Función para agregar lote a elemento seleccionado
                                className="ml-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
                            >
                                <IoMdAddCircle />
                            </button>
                        </div>






                    </div>
                </div>

                <div class="">
                <table className="w-full divide-y divide-gray-200 rounded-xl">
    <thead className="bg-gray-200 border">
        <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subsector</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parte</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Elemento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th> {/* Columna de Lote agregada */}
        </tr>
    </thead>
    <tbody>
    {sectores.length > 0 ? sectores.map((sector) => (
        sector.subsectores.length > 0 ? sector.subsectores.map((subsector) => (
            subsector.partes.length > 0 ? subsector.partes.map((parte) => (
                parte.elementos.length > 0 ? parte.elementos.map((elemento, elementoIndex) => (
                    // Renderiza filas para elementos
                    <tr key={elemento.id} className='bg-gray-50 border'>
                        {elementoIndex === 0 && (
                            <React.Fragment>
                                <td rowSpan={subsector.partes.flatMap(parte => parte.elementos).length} className="px-6 py-4 whitespace-nowrap border">
                                    {sector.nombre}
                                </td>
                                <td rowSpan={parte.elementos.length} className="px-6 py-4 whitespace-nowrap border">
                                    {subsector.nombre}
                                </td>
                                <td rowSpan={parte.elementos.length} className="px-6 py-4 whitespace-nowrap border">
                                    {parte.nombre}
                                </td>
                            </React.Fragment>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap border">{elemento.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap border">
                            {elemento.lotes && elemento.lotes.length > 0 ? (
                                elemento.lotes.map(lote => <div key={lote.id}>{lote.nombre}</div>)
                            ) : "N/A"}
                        </td>
                    </tr>
                )) : (
                    // Renderiza fila para parte si no hay elementos
                    <tr key={parte.id} className='bg-gray-50 border'>
                        <td className="px-6 py-4 whitespace-nowrap border">{sector.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap border">{subsector.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap border">{parte.nombre}</td>
                        <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                        <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                    </tr>
                )
            )) : (
                // Renderiza fila para subsector si no hay partes
                <tr key={subsector.id} className='bg-gray-50 border'>
                    <td className="px-6 py-4 whitespace-nowrap border">{sector.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap border">{subsector.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                    <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                </tr>
            )
        )) : (
            // Renderiza fila para sector si no hay subsectores
            <tr key={sector.id} className='bg-gray-50 border'>
                <td className="px-6 py-4 whitespace-nowrap border">{sector.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
                <td className="px-6 py-4 whitespace-nowrap border">N/A</td>
            </tr>
        )
    )) : (
        // Renderiza un mensaje si no hay sectores
        <tr>
            <td colSpan="5" className="px-6 py-4 whitespace-nowrap border text-center">No hay sectores agregados aún.</td>
        </tr>
    )}
</tbody>


</table>










                </div>

                {mostrarModal && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            {tipoAlerta === 'success' ?
                                <div className='text-green-600 flex justify-center'><IoIosCheckmarkCircle className='text-6xl' /></div>
                                :
                                null
                            }

                             {tipoAlerta === 'error' ?
                                <div className='text-red-600 flex justify-center'><IoCloseCircle className='text-6xl' /></div>
                                :
                                null
                            }

                            <div className="modal-content py-4 text-left px-6 flex justify-center font-medium">
                                {alerta}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Trazabilidad;
