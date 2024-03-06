import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { IoMdAddCircle } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa";
import { TbBuildingFactory } from "react-icons/tb";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircle } from "react-icons/io5";
import { MdOutlineAddLocationAlt } from "react-icons/md";
import { ImLocation } from "react-icons/im";
import { FaEdit } from "react-icons/fa";


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
    const [selectedLote, setSelectedLote] = useState('');

    const [objetoLote, setObjetoLote] = useState({})


    //alertas 
    const [alerta, setAlerta] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);

    const handleCloseAlert = () => {
        setMostrarModal(false)
        setMostrarModalEliminar(false)
    }

    // Modal PPI
    const [mostrarModalPpi, setMostrarModalPpi] = useState(false);

    const handleVerPpi = () => {
        setMostrarModalPpi(true)
    }

    const handleCloseModalPpi = () => {
        setMostrarModalPpi(false)
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




    const agregarSector = async () => {
        try {
            if (!sectorInput.trim()) {
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return;
            }
            const nombreSectorNormalizado = sectorInput.toLowerCase().trim();
            const nombresSectoresNormalizados = sectores.map(sector => sector.nombre.toLowerCase().trim());

            if (nombresSectoresNormalizados.includes(nombreSectorNormalizado)) {
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error');
                setMostrarModal(true);
            } else {
                // Primero, crea el documento sin el campo 'id'
                const nuevoSectorRef = doc(collection(db, `proyectos/${id}/sector`));
                await setDoc(nuevoSectorRef, { nombre: sectorInput });

                // Luego, actualiza el documento recién creado con su 'id'
                await updateDoc(nuevoSectorRef, { id: nuevoSectorRef.id });

                setAlerta('Agregado correctamente.');
                setTipoAlerta('success');
                setMostrarModal(true);
                setSectorInput('');
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

    const agregarSubsector = async (sectorId) => {
        try {
            if (!subSectorInput.trim()) {
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return;
            }
            const nombreSubsectorNormalizado = subSectorInput.toLowerCase().trim();
            const subsectoresDelSector = sectores.find(sector => sector.id === sectorId)?.subsectores || [];
            const nombresSubsectoresNormalizados = subsectoresDelSector.map(subsector => subsector.nombre.toLowerCase().trim());

            if (nombresSubsectoresNormalizados.includes(nombreSubsectorNormalizado)) {
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error');
                setMostrarModal(true);
            } else {
                // Crear el documento con el nombre del subsector y el id del sector
                const nuevoSubsectorRef = doc(collection(db, `proyectos/${id}/sector/${sectorId}/subsector`));
                await setDoc(nuevoSubsectorRef, { nombre: subSectorInput, sectorId: sectorId });

                // No es necesario actualizar el documento para agregar el id, ya que este se genera automáticamente

                setAlerta('Agregado correctamente.');
                setTipoAlerta('success');
                setMostrarModal(true);
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
            // Verificar si el input está vacío o sólo contiene espacios en blanco
            if (!parteInput.trim()) {
                // Mostrar alerta indicando que el campo no puede estar vacío
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return; // Detener la ejecución de la función
            }
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
            // Verificar si el input está vacío o sólo contiene espacios en blanco
            if (!elementoInput.trim()) {
                // Mostrar alerta indicando que el campo no puede estar vacío
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return; // Detener la ejecución de la función
            }
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
        // Verificar si el input de lote está vacío o sólo contiene espacios en blanco
        if (!loteInput.trim()) {
            // Mostrar alerta indicando que el campo no puede estar vacío
            setAlerta('El campo no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return; // Detener la ejecución de la función
        }

        // Verificar si todos los campos requeridos están seleccionados
        if (!elementoId || !selectedParte || !selectedSubSector || !selectedSector) {
            console.error('No se ha seleccionado correctamente el elemento, parte, subsector, sector o PPI.');
            setAlerta('Selecciona correctamente todos los campos requeridos, incluido el PPI.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            // Normalizar el nombre del lote para la verificación
            const nombreLoteNormalizado = loteInput.toLowerCase().trim();

            // Verificar si ya existe un lote con el mismo nombre dentro del elemento seleccionado
            const elementoActual = sectores.find(sector => sector.id === selectedSector)
                ?.subsectores.find(subsector => subsector.id === selectedSubSector)
                ?.partes.find(parte => parte.id === selectedParte)
                ?.elementos.find(elemento => elemento.id === elementoId);

            if (elementoActual && elementoActual.lotes && elementoActual.lotes.some(lote => lote.nombre.toLowerCase().trim() === nombreLoteNormalizado)) {
                setAlerta('El nombre del lote ya existe.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return; // Detener la ejecución de la función
            }

            const loteCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${selectedParte}/elemento/${elementoId}/lote`);

            // Encuentra el PPI seleccionado para incluir su ID y nombre en el nuevo lote
            const ppiSeleccionado = ppis.find(ppi => ppi.id === selectedPpi);

            const nuevoLote = {
                nombre: loteInput,
                ppiId: selectedPpi, // ID del PPI seleccionado
                ppiNombre: ppiSeleccionado ? ppiSeleccionado.nombre : '' // Nombre del PPI seleccionado
            };

            // Agregar el nuevo lote a la base de datos
            const docRef = await addDoc(loteCollectionRef, nuevoLote);

            // Restablecer estados y mostrar mensaje de éxito
            setLoteInput('');
            setSelectedPpi('');
            setAlerta('Lote agregado correctamente con PPI asociado.');
            setTipoAlerta('success');
            setMostrarModal(true);

            // Actualizar el estado para reflejar el nuevo lote agregado
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
                                                        const nuevosLotes = elemento.lotes ? [...elemento.lotes, { ...nuevoLote, id: docRef.id }] : [{ ...nuevoLote, id: docRef.id }];
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
            const lotesData = loteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return lotesData;
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

    const mostrarDetallesLote = async (elementoId, loteId) => {
        if (!loteId) return; // Asegúrate de tener un loteId válido antes de hacer la consulta

        try {
            const loteRef = doc(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${selectedParte}/elemento/${elementoId}/lote`, loteId);
            const loteSnapshot = await getDoc(loteRef);

            if (loteSnapshot.exists()) {
                setObjetoLote(loteSnapshot.data());

            } else {
                console.log("No se encontró el lote");
            }
        } catch (error) {
            console.error("Error al obtener detalles del lote:", error);
        }
    };


    const handleLoteChange = (event) => {
        const loteIdSeleccionado = event.target.value;
        setSelectedLote(loteIdSeleccionado);
        // Llamar a la función para obtener los PPIs asociados al lote seleccionado
        obtenerPpiPorLote(loteIdSeleccionado);
    };

    const [ppiObject, setPpiObject] = useState(null);
    const [mesnajePpi, setmensajePpi] = useState('');

    const obtenerPpiPorLote = async (idLote) => {
        try {
            const ppiCollectionRef = collection(db, 'ppis');
            const q = query(ppiCollectionRef, where('idLote', '==', idLote));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Si se encuentra un PPI, guardar el primer documento
                const doc = querySnapshot.docs[0];
                console.log(doc.id, " => ", doc.data());
                setPpiObject({ id: doc.id, data: doc.data() });
            } else {


                setmensajePpi("No se encontraron PPIs para el lote con ID:", idLote);
                // Si no se encuentra ningún PPI, establecer el objeto en null
                setPpiObject(null);
            }
        } catch (error) {
            console.error("Error al obtener PPIs por lote:", error);
        }
    };





    const [ppis, setPpis] = useState([]);
    const [selectedPpi, setSelectedPpi] = useState("");

    // Función para cargar los PPIs
    const cargarPpis = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "ppis"));
            const ppisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPpis(ppisList);
        } catch (error) {
            console.error("Error al cargar los PPIs:", error);
        }
    };

    // Llamar a cargarPpis en useEffect para cargar los PPIs al montar el componente
    useEffect(() => {
        cargarPpis();
    }, []);


    const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false)
    const [sectorIdAEliminar, setSectorIdAEliminar] = useState(null);
    const [subsectorIdAEliminar, setSubsectorIdAEliminar] = useState(null);


    const eliminarSubsector = async (sectorId, subsectorId) => {
        try {
            // Elimina el subsector de Firestore
            const subsectorRef = doc(db, `proyectos/${id}/sector/${sectorIdAEliminar}/subsector`, subsectorIdAEliminar);
            await deleteDoc(subsectorRef);

            // Elimina el subsector del estado local
            const sectoresActualizados = sectores.map((sector) => {
                if (sector.id === sectorId) {
                    // Filtra el subsector que se va a eliminar
                    const subsectoresActualizados = sector.subsectores.filter(subsector => subsector.id !== subsectorId);
                    return { ...sector, subsectores: subsectoresActualizados };
                }
                return sector;
            });

            // Actualiza el estado con la nueva lista de sectores
            setSectores(sectoresActualizados);

            // Muestra mensaje de éxito y cierra el modal
            setAlerta('Subsector eliminado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
            setMostrarModalEliminar(false);
        } catch (error) {
            console.error('Error al eliminar el subsector:', error);
            setAlerta('Error al eliminar el subsector.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
    };


    const confirmarDeleteSubSector = (sectorId, subsectorId) => {
        setSectorIdAEliminar(sectorId);
        setSubsectorIdAEliminar(subsectorId);
        setMostrarModalEliminar(true);
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
                <div className="mt-4 flex flex-col ">


                    <div className='grid grid-cols-5 text-sm'>
                        {/* Sector */}
                        <div className="flex flex-col items-start gap-3 border-r-2 p-5">
                            <p className='text-lg font-medium text-gray-500 flex items-center gap-2'><TbBuildingFactory /> Sector</p>
                            <div className="flex items-center">
                                <input
                                    placeholder='Agregar sector'
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

                        </div>
                        {/* Sub Sector */}
                        <div className="flex flex-col items-start gap-3 border-r-2 p-5">
                            <p className='text-lg font-medium text-gray-500 flex items-center gap-2'><TbBuildingFactory /> Sub sector</p>
                            <div className="flex flex-col items-start gap-3">
                                <label htmlFor="sectores"><strong className='text-amber-600 '>*</strong> Para agregar información selecciona el sector: </label>
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

                            <div className="flex items-center">

                                <input
                                    placeholder='Agregar sub sector: '
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

                        </div>

                        <div className="flex flex-col items-start gap-3 border-r-2 p-5">
                            <p className='text-lg font-medium text-gray-500 flex items-center gap-2'><TbBuildingFactory /> Parte</p>
                            <div className="flex flex-col items-start gap-3">
                                <label htmlFor="subsectores"><strong className='text-amber-600'>*</strong> Para agregar información selecciona el sub sector: </label>
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
                            <div className="flex items-center">

                                <input
                                    placeholder='Agregar parte: '
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

                        <div className="flex flex-col items-start gap-3 border-r-2 p-5">
                            <p className='text-lg font-medium text-gray-500 flex items-center gap-2'><TbBuildingFactory /> Elemento</p>
                            <div className="flex flex-col items-start gap-3">
                                <label htmlFor="partes"><strong className='text-amber-600'>*</strong> Para agregar información selecciona el parte: </label>
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
                            <div className="flex items-center">

                                <input
                                    placeholder='Agregar elemento: '
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



                        </div>


                        <div className="flex flex-col items-start gap-3 p-5">
                            <p className='text-lg font-medium text-gray-500 flex items-center gap-2'><TbBuildingFactory /> Lote y ppi</p>
                            <div className="flex flex-col items-start gap-3">
                                <label htmlFor="elementos"><strong className='text-amber-600'>*</strong> Para agregar información selecciona el elemento: </label>
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
                            <div className="flex flex-col items-start gap-3">
                                <select
                                    value={selectedPpi}
                                    onChange={(e) => setSelectedPpi(e.target.value)}
                                    className="border px-3 py-1 rounded-lg"
                                >
                                    <option value="">Seleccione un PPI</option>
                                    {ppis.map(ppi => (
                                        <option key={ppi.id} value={ppi.id}>{ppi.nombre}</option>
                                    ))}
                                </select>
                                <div className="flex items-start">
                                    <input
                                        placeholder='Agregar lote: '
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





                    </div>
                </div>

                <div className="mt-5">
                    <div className='grid grid-cols-5 bg-gray-200 rounded-t-lg  border font-medium'>
                        <p className='px-4 py-2'>Sector</p>
                        <p className='border-r-2 border-l-2  border-gray-300 px-4 py-2'>Sub sector</p>
                        <p className='border-r-2 border-gray-300 px-4 py-2'>Parte</p>
                        <p className='border-r-2 border-gray-300 px-4 py-2'>Elemento</p>
                        <p className='px-4 py-2'>Lote y ppi</p>
                    </div>

                    <div className="divide-y divide-gray-200 border rounded-b-lg">
                        {sectores.map((sector, index) => (
                            <div key={sector.id} className={`flex flex-wrap items-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                <h2 className="text-lg font-medium px-4 py-2 rounded-lg w-full md:w-1/5">{sector.nombre}</h2>
                                {sector.subsectores && sector.subsectores.length > 0 && (
                                    <ul className="divide-y divide-gray-200 w-full md:w-4/5">
                                        {sector.subsectores.map((subsector) => (
                                            subsector.partes && subsector.partes.length > 0 ? (
                                                subsector.partes.map((parte) => (
                                                    parte.elementos && parte.elementos.length > 0 ? (
                                                        parte.elementos.map((elemento) => (
                                                            elemento.lotes && elemento.lotes.length > 0 ? (
                                                                elemento.lotes.map((lote) => (
                                                                    <li key={lote.id} className="grid grid-cols-4 items-center py-4 ">
                                                                        <div className='flex justify-between pr-5 gap-1 border-r-2 border-l-2'>
                                                                            <p className='px-4 '>{subsector.nombre}</p>
                                                                            <div className='flex gap-4'>
                                                                                <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-lg'><IoCloseCircle /></button>
                                                                            </div>
                                                                        </div>




                                                                        <p className='px-4 border-r-2'>{parte.nombre}</p>
                                                                        <p className='px-4 border-r-2'>{elemento.nombre}</p>
                                                                        <div className='flex flex-col justify-center  px-4'>
                                                                            <p className='font-medium'>{lote.nombre}</p>
                                                                            <div className='flex justify-between'>
                                                                                <div>
                                                                                    <p className={`${lote.ppiNombre ? 'text-green-500' : 'text-red-500'}`}>
                                                                                        {lote.ppiNombre ? lote.ppiNombre : "Ppi sin Asignar"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className='flex gap-4'>
                                                                                    <button className='text-xl'><FaEdit /></button>
                                                                                    <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-2xl'><IoCloseCircle /></button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li key={`${elemento.id}-sin-lote`} className="font-medium grid grid-cols-4">
                                                                    <p className='px-4'>{subsector.nombre}</p>
                                                                    <p className='px-4'>{parte.nombre}</p>
                                                                    <p className='px-4'>{elemento.nombre}</p>
                                                                    <div className='flex gap-3 px-4'>
                                                                        <p>-</p>
                                                                        <p className="text-red-500">Sin PPI</p>
                                                                        <div>
                                                                            <button className='text-xl'><FaEdit /></button>
                                                                            <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-2xl'><IoCloseCircle /></button>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            )
                                                        ))
                                                    ) : (
                                                        <li key={`${parte.id}-sin-elemento`} className="font-medium grid grid-cols-4">
                                                            <p className='px-4'>{subsector.nombre}</p>
                                                            <p className='px-4'>{parte.nombre}</p>
                                                            <p className='px-4'>-</p>
                                                            <div className='flex gap-3 px-4'>
                                                                <p>-</p>
                                                                <p className="text-red-500">Sin PPI</p>
                                                                <div>
                                                                    <button className='text-xl'><FaEdit /></button>
                                                                    <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-2xl'><IoCloseCircle /></button>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                ))
                                            ) : (
                                                <li key={`${subsector.id}-sin-parte`} className="font-medium grid grid-cols-4">
                                                    <p className='px-4'>{subsector.nombre}</p>
                                                    <p className='px-4'>-</p>
                                                    <p className='px-4'>-</p>
                                                    <div className='flex gap-3 px-4'>
                                                        <p>-</p>
                                                        <p className="text-red-500">-</p>
                                                        <div>
                                                            <button className='text-xl'><FaEdit /></button>
                                                            <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-2xl'><IoCloseCircle /></button>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                {mostrarModalEliminar && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-xs mt-2'>* Se eliminara el sub sector completo con sus datos asociados</p>
                            </div>

                            <div className='flex justify-center gap-5 mt-3'>
                                <button
                                    onClick={eliminarSubsector}
                                    className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'>Eliminar</button>
                                <button
                                    onClick={handleCloseAlert}
                                    className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

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

                {mostrarModalPpi && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white mx-auto rounded shadow-lg z-50 overflow-y-auto p-5"
                            style={{ width: '320px', height: 'auto', maxWidth: '100%' }}>
                            <button onClick={handleCloseModalPpi} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>

                            <div className='text-center flex justify-center flex-col items-center gap-2'>
                                <MdOutlineAddLocationAlt className='font-bold text-2xl' />

                                <p><strong>Lote: </strong>{objetoLote.nombre ? objetoLote.nombre : "Ppi no encontrado, selecciona la ubicación correctamente"}</p>

                                {ppiObject && ppiObject.data && (
                                    <div>
                                        <p><strong>Ppi: </strong>{ppiObject.data.nombre}</p>
                                    </div>
                                )}

                                {!ppiObject && (
                                    <div>
                                        <p className='font-medium'>No se encontraron PPIs para el lote.</p>
                                        <Link to={`/agregarPpi/${selectedLote}`}>
                                            <button className='bg-amber-600 text-white px-4 py-1 rounded-md mt-2 font-medium text-sm'>Agregar Ppi</button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}



            </div>
        </div>
    );
}

export default Trazabilidad;




