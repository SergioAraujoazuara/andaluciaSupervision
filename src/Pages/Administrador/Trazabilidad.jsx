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
import { RiDeleteBinLine } from "react-icons/ri";


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
        setMostrarModalEliminarSector(false)
        setMostrarModalEliminarSubSector(false)
        setMostrarModalEliminarParte(false)
        setMostrarModalEliminarElemento(false)
        setMostrarModalEliminarLote(false)

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
                // Obtener el nombre del sector seleccionado
                const sectorSeleccionado = sectores.find(sector => sector.id === sectorId);
                const sectorNombre = sectorSeleccionado ? sectorSeleccionado.nombre : '';
    
                // Crear el documento con el nombre del subsector, el id y el nombre del sector
                const nuevoSubsectorRef = doc(collection(db, `proyectos/${id}/sector/${sectorId}/subsector`));
                await setDoc(nuevoSubsectorRef, { nombre: subSectorInput, sectorId: sectorId, sectorNombre: sectorNombre });
    
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
            if (!parteInput.trim()) {
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return;
            }
            const nombreParteNormalizado = parteInput.toLowerCase().trim();
    
            // Encuentra el subsector y el sector seleccionados
            let subSectorNombre = '', sectorNombre = '';
            const subsectorSeleccionado = sectores.flatMap(sector => {
                if (sector.id === selectedSector) {
                    sectorNombre = sector.nombre; // Obtener el nombre del sector
                }
                return sector.subsectores;
            }).find(subsector => subsector.id === subSectorId);
    
            if (subsectorSeleccionado) {
                subSectorNombre = subsectorSeleccionado.nombre; // Obtener el nombre del subsector
            }
    
            const nombresPartesNormalizados = subsectorSeleccionado?.partes.map(parte => parte.nombre.toLowerCase().trim()) || [];
            if (nombresPartesNormalizados.includes(nombreParteNormalizado)) {
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error');
                setMostrarModal(true);
            } else {
                const parteCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${subSectorId}/parte`);
                const batch = writeBatch(db);
                const nuevaParteRef = doc(parteCollectionRef);
                // Agregar nombre del sector y del subsector al documento
                batch.set(nuevaParteRef, {
                    nombre: parteInput,
                    sectorId: selectedSector,
                    subSectorId: subSectorId,
                    sectorNombre: sectorNombre, // Agregado
                    subSectorNombre: subSectorNombre, // Agregado
                });
                await batch.commit();
    
                setAlerta('Agregado correctamente.');
                setTipoAlerta('success');
                setMostrarModal(true);
                setParteInput('');
    
                // Actualizar la UI con los nuevos subsectores
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
            if (!elementoInput.trim()) {
                setAlerta('El campo no puede estar vacío.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return; // Detener la ejecución de la función
            }
    
            const nombreElementoNormalizado = elementoInput.toLowerCase().trim();
            let sectorNombre = '', subSectorNombre = '', parteNombre = '';
    
            // Encuentra los nombres del sector y subsector seleccionados, y el nombre de la parte
            const sectorSeleccionado = sectores.find(sector => sector.id === selectedSector);
            if (sectorSeleccionado) {
                sectorNombre = sectorSeleccionado.nombre; // Obtener el nombre del sector
                const subsectorSeleccionado = sectorSeleccionado.subsectores.find(subsector => subsector.id === selectedSubSector);
                if (subsectorSeleccionado) {
                    subSectorNombre = subsectorSeleccionado.nombre; // Obtener el nombre del subsector
                    const parteSeleccionada = subsectorSeleccionado.partes.find(parte => parte.id === parteId);
                    if (parteSeleccionada) {
                        parteNombre = parteSeleccionada.nombre; // Obtener el nombre de la parte
                    }
                }
            }
    
            const elementoCollectionRef = collection(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${parteId}/elemento`);
            const elementosSnapshot = await getDocs(elementoCollectionRef);
            const nombresElementosExistentes = elementosSnapshot.docs.map(doc => doc.data().nombre.toLowerCase().trim());
    
            if (nombresElementosExistentes.includes(nombreElementoNormalizado)) {
                setAlerta('El nombre ya existe en la base de datos.');
                setTipoAlerta('error');
                setMostrarModal(true);
            } else {
                const nuevoElementoRef = doc(elementoCollectionRef);
                await setDoc(nuevoElementoRef, {
                    nombre: elementoInput,
                    sectorId: selectedSector,
                    subSectorId: selectedSubSector,
                    parteId: parteId,
                    sectorNombre: sectorNombre, // Nombre del sector
                    subSectorNombre: subSectorNombre, // Nombre del subsector
                    parteNombre: parteNombre, // Nombre de la parte
                });
    
                // Actualización de la UI con el nuevo elemento
                const nuevosSectores = sectores.map(sector => {
                    if (sector.id === selectedSector) {
                        return {
                            ...sector,
                            subsectores: sector.subsectores.map(subsector => {
                                if (subsector.id === selectedSubSector) {
                                    return {
                                        ...subsector,
                                        partes: subsector.partes.map(parte => {
                                            if (parte.id === parteId) {
                                                const nuevoElemento = {
                                                    id: nuevoElementoRef.id,
                                                    nombre: elementoInput,
                                                    sectorNombre, // Agregado
                                                    subSectorNombre, // Agregado
                                                    parteNombre, // Agregado
                                                };
                                                const nuevosElementos = [...parte.elementos, nuevoElemento];
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
    
                setSectores(nuevosSectores);
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
        // Verificación inicial de los campos requeridos
        if (!loteInput.trim()) {
            setAlerta('El campo no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }
    
        if (!elementoId || !selectedParte || !selectedSubSector || !selectedSector) {
            console.error('No se ha seleccionado correctamente el elemento, parte, subsector, sector.');
            setAlerta('Selecciona correctamente todos los campos requeridos.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }
    
        if (!selectedPpi) {
            console.error('No se ha seleccionado un PPI.');
            setAlerta('Debes seleccionar un PPI.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }
    
        try {
            const nombreLoteNormalizado = loteInput.toLowerCase().trim();
            
            // Genera un ID único para el nuevo lote
            const loteId = doc(collection(db, 'lotes')).id;
    
            // Encuentra los nombres del sector, subsector, parte y elemento
            let sectorNombre = '', subSectorNombre = '', parteNombre = '', elementoNombre = '';
            const sectorSeleccionado = sectores.find(sector => sector.id === selectedSector);
            if (sectorSeleccionado) {
                sectorNombre = sectorSeleccionado.nombre;
                const subsectorSeleccionado = sectorSeleccionado.subsectores.find(subsector => subsector.id === selectedSubSector);
                if (subsectorSeleccionado) {
                    subSectorNombre = subsectorSeleccionado.nombre;
                    const parteSeleccionada = subsectorSeleccionado.partes.find(parte => parte.id === selectedParte);
                    if (parteSeleccionada) {
                        parteNombre = parteSeleccionada.nombre;
                        const elementoSeleccionado = parteSeleccionada.elementos.find(elemento => elemento.id === elementoId);
                        if (elementoSeleccionado) {
                            elementoNombre = elementoSeleccionado.nombre;
                        }
                    }
                }
            }
    
            // Verifica si el nombre del lote ya existe
            const elementoActual = sectores.flatMap(sector => sector.subsectores)
                .flatMap(subsector => subsector.partes)
                .flatMap(parte => parte.elementos)
                .find(elemento => elemento.id === elementoId);
            if (elementoActual && elementoActual.lotes && elementoActual.lotes.some(lote => lote.nombre.toLowerCase().trim() === nombreLoteNormalizado)) {
                setAlerta('El nombre del lote ya existe.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return;
            }
    
            // Prepara el nuevo lote
            const nuevoLote = {
                nombre: loteInput,
                ppiId: selectedPpi,
                ppiNombre: ppis.find(ppi => ppi.id === selectedPpi)?.nombre || '',
                idSector: selectedSector,
                idSubSector: selectedSubSector,
                parteId: selectedParte,
                elementoId: elementoId,
                sectorNombre: sectorNombre,
                subSectorNombre: subSectorNombre,
                parteNombre: parteNombre,
                elementoNombre: elementoNombre,
            };
    
            // Referencia a la subcolección específica y añade el nuevo lote
            const loteSubColeccionRef = doc(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${selectedParte}/elemento/${elementoId}/lote/${loteId}`);
            await setDoc(loteSubColeccionRef, nuevoLote);
    
            // Referencia a la colección principal y añade el nuevo lote
            const lotePrincipalRef = doc(db, `lotes/${loteId}`);
            await setDoc(lotePrincipalRef, nuevoLote);
    
            // Limpia los campos y muestra alerta de éxito
            setLoteInput('');
            setSelectedPpi('');
            setAlerta('Lote agregado correctamente con PPI asociado.');
            setTipoAlerta('success');
            setMostrarModal(true);
    
            // Actualización del estado para incluir el nuevo lote sin necesidad de recargar
            // (Asegúrate de que esta parte se adapta correctamente a cómo gestionas el estado de 'sectores')
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
                                                        const nuevosLotes = elemento.lotes ? [...elemento.lotes, { ...nuevoLote, id: loteId }] : [{ ...nuevoLote, id: loteId }];
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


    const [mostrarModalEliminarSubSector, setMostrarModalEliminarSubSector] = useState(false)
    const [sectorIdAEliminar, setSectorIdAEliminar] = useState(null);
    const [subsectorIdAEliminar, setSubsectorIdAEliminar] = useState(null);

    

    //Eliminar sub sector
    const eliminarSubsector = async () => {
        try {
            const subsectorRef = doc(db, `proyectos/${id}/sector/${sectorIdAEliminar}/subsector`, subsectorIdAEliminar);
            await deleteDoc(subsectorRef);

            // Actualizar el estado para excluir el subsector eliminado
            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEliminar) {
                    const subsectoresActualizados = sector.subsectores.filter(subsector => subsector.id !== subsectorIdAEliminar);
                    return { ...sector, subsectores: subsectoresActualizados };
                }
                return sector;
            });
            setSectores(sectoresActualizados);

            setAlerta('Subsector eliminado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al eliminar el subsector:', error);
            setAlerta('Error al eliminar el subsector.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
        setMostrarModalEliminarSubSector(false);
    };


    // Elminar lote
    const [mostrarModalEliminarLote, setMostrarModalEliminarLote] = useState(false);
    const [loteIdAEliminar, setLoteIdAEliminar] = useState(null);

    const confirmarDeleteLote = (sectorId, subsectorId, parteId, elementoId, loteId) => {
        setSectorIdAEliminar(sectorId);
        setSubsectorIdAEliminar(subsectorId);
        setParteIdAEliminar(parteId);
        setElementoIdAEliminar(elementoId);
        setLoteIdAEliminar(loteId);
        setMostrarModalEliminarLote(true);
    };

    const eliminarLote = async () => {
        try {
            // Paso 1: Eliminar el lote de la subcolección específica en Firestore
            const loteRefSubcoleccion = doc(db, `proyectos/${id}/sector/${sectorIdAEliminar}/subsector/${subsectorIdAEliminar}/parte/${parteIdAEliminar}/elemento/${elementoIdAEliminar}/lote/${loteIdAEliminar}`);
            await deleteDoc(loteRefSubcoleccion);
    
            // Paso 1.1: Eliminar el lote de la colección principal 'lotes'
            const loteRefPrincipal = doc(db, `lotes/${loteIdAEliminar}`);
            await deleteDoc(loteRefPrincipal);
    
            // Paso 2: Actualizar el estado para reflejar la eliminación del lote
            setSectores(prevSectores => prevSectores.map(sector => {
                if (sector.id === sectorIdAEliminar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subsectorIdAEliminar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.map(parte => {
                                        if (parte.id === parteIdAEliminar) {
                                            return {
                                                ...parte,
                                                elementos: parte.elementos.map(elemento => {
                                                    if (elemento.id === elementoIdAEliminar) {
                                                        // Filtrar el lote eliminado
                                                        const lotesActualizados = elemento.lotes.filter(lote => lote.id !== loteIdAEliminar);
                                                        return {
                                                            ...elemento,
                                                            lotes: lotesActualizados
                                                        };
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
            }));
    
            // Paso 3: Mostrar mensaje de éxito y cerrar el modal de confirmación
            setAlerta('Lote eliminado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            // En caso de error, mostrar mensaje de error y cerrar el modal de confirmación
            console.error('Error al eliminar el lote:', error);
            setAlerta('Error al eliminar el lote.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
    
        // Restablece el estado de las variables relacionadas con la eliminación
        setMostrarModalEliminarLote(false);
        setSectorIdAEliminar(null);
        setSubsectorIdAEliminar(null);
        setParteIdAEliminar(null);
        setElementoIdAEliminar(null);
        setLoteIdAEliminar(null);
    };
    





    const confirmarDeleteSubSector = (sectorId, subsectorId) => {
        setSectorIdAEliminar(sectorId);
        setSubsectorIdAEliminar(subsectorId);
        setMostrarModalEliminarSubSector(true);
    };


    // Eliminar sector
    const [mostrarModalEliminarSector, setMostrarModalEliminarSector] = useState(false)

    const solicitarEliminarSector = (sectorId) => {
        setSectorIdAEliminar(sectorId);
        setMostrarModalEliminarSector(true);
    };

    const eliminarSector = async () => {
        try {
            // Referencia al documento del sector a eliminar
            const sectorRef = doc(db, `proyectos/${id}/sector`, sectorIdAEliminar);
            await deleteDoc(sectorRef);

            // Filtrar el estado actual para excluir el sector eliminado
            const sectoresActualizados = sectores.filter(sector => sector.id !== sectorIdAEliminar);
            setSectores(sectoresActualizados);

            setAlerta('Sector eliminado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al eliminar el sector:', error);
            setAlerta('Error al eliminar el sector.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        // Ocultar el modal de confirmación
        setMostrarModalEliminarSector(false);
    };

    const [parteIdAEliminar, setParteIdAEliminar] = useState(null);
    const [mostrarModalEliminarParte, setMostrarModalEliminarParte] = useState(false)

    const confirmarDeleteParte = (sectorId, subsectorId, parteId) => {
        setSectorIdAEliminar(sectorId); // Asegúrate de tener este estado si necesitas referenciar al sector para la eliminación
        setSubsectorIdAEliminar(subsectorId); // Similarmente, si necesitas el ID del subsector, asegúrate de tener un estado para ello
        setParteIdAEliminar(parteId);
        setMostrarModalEliminarParte(true);
    };

    const eliminarParte = async () => {
        try {
            const parteRef = doc(db, `proyectos/${id}/sector/${sectorIdAEliminar}/subsector/${subsectorIdAEliminar}/parte`, parteIdAEliminar);
            await deleteDoc(parteRef);

            // Actualizar el estado de 'sectores' para reflejar la eliminación de la parte
            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEliminar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subsectorIdAEliminar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.filter(parte => parte.id !== parteIdAEliminar),
                                };
                            }
                            return subsector;
                        }),
                    };
                }
                return sector;
            });

            setSectores(sectoresActualizados);
            setAlerta('Parte eliminada correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al eliminar la parte:', error);
            setAlerta('Error al eliminar la parte.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEliminarParte(false);
    };


    // Eliminar elemento
    const [mostrarModalEliminarElemento, setMostrarModalEliminarElemento] = useState(false);
    const [elementoIdAEliminar, setElementoIdAEliminar] = useState(null);

    const confirmarDeleteElemento = (sectorId, subsectorId, parteId, elementoId) => {
        setSectorIdAEliminar(sectorId);
        setSubsectorIdAEliminar(subsectorId);
        setParteIdAEliminar(parteId);
        setElementoIdAEliminar(elementoId);
        setMostrarModalEliminarElemento(true);
    };

    const eliminarElemento = async () => {
        try {
            const elementoRef = doc(db, `proyectos/${id}/sector/${sectorIdAEliminar}/subsector/${subsectorIdAEliminar}/parte/${parteIdAEliminar}/elemento`, elementoIdAEliminar);
            await deleteDoc(elementoRef);

            // Actualizar el estado para reflejar la eliminación del elemento
            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEliminar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subsectorIdAEliminar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.map(parte => {
                                        if (parte.id === parteIdAEliminar) {
                                            return {
                                                ...parte,
                                                elementos: parte.elementos.filter(elemento => elemento.id !== elementoIdAEliminar)
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

            setAlerta('Elemento eliminado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al eliminar el elemento:', error);
            setAlerta('Error al eliminar el elemento.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }
        setMostrarModalEliminarElemento(false);
    };






    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Editar

    // const [mostrarModalEditarSector, setMostrarModalEditarSector] = useState(false);
    // const [sectorIdAEditar, setSectorIdAEditar] = useState(null);
    // const [nuevoNombreSector, setNuevoNombreSector] = useState('');

    // const solicitarEditarSector = (sectorId, nombreActual) => {
    //     setSectorIdAEditar(sectorId);
    //     setNuevoNombreSector(nombreActual); // Pre-populate the input with the current name
    //     setMostrarModalEditarSector(true);
    // };
    // const guardarEdicionSector = async () => {
    //     if (!nuevoNombreSector.trim()) {
    //         setAlerta('El nombre del sector no puede estar vacío.');
    //         setTipoAlerta('error');
    //         setMostrarModal(true);
    //         return;
    //     }
    //     try {
    //         const sectorRef = doc(db, `proyectos/${id}/sector`, sectorIdAEditar);
    //         await updateDoc(sectorRef, { nombre: nuevoNombreSector });

    //         const sectoresActualizados = sectores.map(sector =>
    //             sector.id === sectorIdAEditar ? { ...sector, nombre: nuevoNombreSector } : sector
    //         );
    //         setSectores(sectoresActualizados);

    //         setAlerta('Sector actualizado correctamente.');
    //         setTipoAlerta('success');
    //         setMostrarModal(true);
    //     } catch (error) {
    //         console.error('Error al actualizar el sector:', error);
    //         setAlerta('Error al actualizar el sector.');
    //         setTipoAlerta('error');
    //         setMostrarModal(true);
    //     }
    //     setMostrarModalEditarSector(false);
    // };


    return (
        <div className='min-h-screen px-14 py-5 text-gray-500'>
            {/* Encabezado */}
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                
                <Link to={'/admin'}>
                    <h1 className='text-gray-600'>Administración</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/viewProject'}>
                    <h1 className=' text-gray-600'>Ver proyectos</h1>
                </Link>
                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Trazabilidad </h1>
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
                                <div className="text-lg font-medium px-4 py-2 rounded-lg w-full md:w-1/5 group cursor-pointer flex justify-between">
                                    <p>{sector.nombre}</p>
                                    {/* <button
                                        onClick={() => solicitarEditarSector(sector.id, sector.nombre)}
                                        className="editar-sector-btn"
                                    >
                                        Editar
                                    </button> */}
                                    <button
                                        onClick={() => solicitarEliminarSector(sector.id)}
                                        className="text-amber-600 text-md opacity-0 group-hover:opacity-100"
                                    >
                                        <RiDeleteBinLine />
                                    </button>

                                </div>
                                {sector.subsectores && sector.subsectores.length > 0 && (
                                    <ul className="divide-y divide-gray-200 w-full md:w-4/5">
                                        {sector.subsectores.map((subsector) => (
                                            subsector.partes && subsector.partes.length > 0 ? (
                                                subsector.partes.map((parte) => (
                                                    parte.elementos && parte.elementos.length > 0 ? (
                                                        parte.elementos.map((elemento) => (
                                                            elemento.lotes && elemento.lotes.length > 0 ? (
                                                                elemento.lotes.map((lote) => (
                                                                    <li key={lote.id} className="grid grid-cols-4 items-center py-4">
                                                                        <div className='flex justify-between items-center pr-5 gap-1 border-r-2 border-l-2 group cursor-pointer'>
                                                                            <p className='px-4 '>{subsector.nombre}</p>
                                                                            <div className='flex gap-4'>
                                                                                <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                            </div>
                                                                        </div>

                                                                        <div className='flex justify-between items-center pr-5 gap-1 border-r-2  group cursor-pointer'>
                                                                            <p className='px-4'>{parte.nombre}</p>
                                                                            <div className='flex gap-4'>
                                                                                <button onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                            </div>
                                                                        </div>
                                                                        <div className='flex justify-between items-center pr-5 gap-1 border-r-2  group cursor-pointer'>
                                                                            <p className='px-4 '>{elemento.nombre}</p>
                                                                            <div className='flex gap-4'>

                                                                                <button onClick={() => confirmarDeleteElemento(sector.id, subsector.id, parte.id, elemento.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                            </div>
                                                                        </div>



                                                                        <div className='flex flex-col justify-center px-4 group'>
                                                                            <p className='font-medium'>{lote.nombre}</p>
                                                                            <div className='flex justify-between'>
                                                                                <div>
                                                                                    <p className={`${lote.ppiNombre ? 'text-green-500' : 'text-red-500'}`}>
                                                                                        {lote.ppiNombre ? lote.ppiNombre : "Ppi sin Asignar"}
                                                                                    </p>
                                                                                </div>
                                                                                <div className='flex gap-4'>
                                                                                    {/* Condición para mostrar el botón solo si existe un ppiId */}
                                                                                    {lote.ppiId && (
                                                                                        <div>



                                                                                            <button
                                                                                                onClick={() => confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)}
                                                                                                className='text-amber-600 text-md opacity-0 group-hover:opacity-100'>
                                                                                                <RiDeleteBinLine />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                            ) : (
                                                                <li key={`${elemento.id}-sin-lote`} className="grid grid-cols-4 items-center py-4 ">
                                                                    <div className='flex justify-between items-center pr-5 gap-1 border-r-2 border-l-2 group cursor-pointer'>
                                                                        <p className='px-4 '>{subsector.nombre}</p>
                                                                        <div className='flex gap-4'>
                                                                            <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex justify-between items-center pr-5 gap-1 border-r-2  group cursor-pointer'>
                                                                        <p className='px-4'>{parte.nombre}</p>
                                                                        <div className='flex gap-4'>
                                                                            <button onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex justify-between items-center pr-5 gap-1 border-r-2  group cursor-pointer'>
                                                                        <p className='px-4'>{elemento.nombre}</p>
                                                                        <div className='flex gap-4'>
                                                                            <button onClick={() => confirmarDeleteElemento(sector.id, subsector.id, parte.id, elemento.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                        </div>
                                                                    </div>
                                                                    <div className='lex flex-col justify-center px-4'>
                                                                        <div className='flex justify-between'>
                                                                            <div>
                                                                                <p>-</p>
                                                                                <p className="text-red-500">-</p>
                                                                            </div>

                                                                            <div className='flex gap-4'>
                                                                                {/* Condición para mostrar el botón solo si existe un ppiId */}
                                                                                {lote.ppiId && (
                                                                                    <button onClick={() => confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'>
                                                                                        <RiDeleteBinLine />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            )
                                                        ))
                                                    ) : (
                                                        <li key={`${parte.id}-sin-elemento`} className="items-center grid grid-cols-4">
                                                            <div className='flex justify-between items-center pr-5 gap-1 border-r-2 border-l-2 cursor-pointer group'>
                                                                <p className='px-4 '>{subsector.nombre}</p>
                                                                <div className='flex gap-4'>
                                                                    <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                </div>
                                                            </div>
                                                            <div className='flex justify-between items-center pr-5 gap-1 border-r-2  group cursor-pointer'>
                                                                <p className='px-4'>{parte.nombre}</p>
                                                                <div className='flex gap-4'>
                                                                    <button onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                                </div>
                                                            </div>
                                                            <p className='px-4 border-r-2'>-</p>
                                                            <div className='lex flex-col justify-center px-4'>
                                                                <div className='flex justify-between'>
                                                                    <div>
                                                                        <p>-</p>
                                                                        <p className="text-red-500">-</p>
                                                                    </div>

                                                                    <div className='flex gap-4'>
                                                                        {/* Condición para mostrar el botón solo si existe un ppiId */}
                                                                        {lote.ppiId && (
                                                                            <button onClick={() => confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'>
                                                                                <RiDeleteBinLine />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                ))
                                            ) : (
                                                <li key={`${subsector.id}-sin-parte`} className="grid grid-cols-4 items-center">
                                                    <div className='flex justify-between pr-5 gap-1 border-r-2 border-l-2 cursor-pointer group'>
                                                        <p className='px-4 '>{subsector.nombre}</p>
                                                        <div className='flex gap-4'>
                                                            <button onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'><RiDeleteBinLine /></button>
                                                        </div>
                                                    </div>
                                                    <p className='px-4 border-r-2'>-</p>
                                                    <p className='px-4 border-r-2'>-</p>
                                                    <div className='lex flex-col justify-center px-4'>
                                                        <div className='flex justify-between'>
                                                            <div>
                                                                <p>-</p>
                                                                <p className="text-red-500">-</p>
                                                            </div>

                                                            <div className='flex gap-4'>
                                                                {/* Condición para mostrar el botón solo si existe un ppiId */}
                                                                {lote.ppiId && (
                                                                    <button onClick={() => confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)} className='text-amber-600 text-md opacity-0 group-hover:opacity-100'>
                                                                        <RiDeleteBinLine />
                                                                    </button>
                                                                )}
                                                            </div>
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


                {mostrarModalEliminarSubSector && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-sm mt-2'>* Se eliminara el elemento seleccionado con sus datos asociados</p>
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
                {mostrarModalEliminarSector && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-sm mt-2'>* Se eliminara el elemento seleccionado con sus datos asociados</p>
                            </div>

                            <div className='flex justify-center gap-5 mt-3'>
                                <button
                                    onClick={eliminarSector}
                                    className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'>Eliminar</button>
                                <button
                                    onClick={handleCloseAlert}
                                    className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEliminarParte && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-sm mt-2'>* Se eliminara el elemento seleccionado con sus datos asociados</p>
                            </div>

                            <div className='flex justify-center gap-5 mt-3'>
                                <button
                                    onClick={eliminarParte}
                                    className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'>Eliminar</button>
                                <button
                                    onClick={handleCloseAlert}
                                    className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
                {mostrarModalEliminarElemento && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-sm mt-2'>* Se eliminara el elemento seleccionado con sus datos asociados</p>
                            </div>

                            <div className='flex justify-center gap-5 mt-3'>
                                <button
                                    onClick={eliminarElemento}
                                    className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'>Eliminar</button>
                                <button
                                    onClick={handleCloseAlert}
                                    className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEliminarLote && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

                            <button onClick={handleCloseAlert} className="text-2xl w-full flex justify-end text-gray-500"><IoCloseCircle /></button>
                            <div>
                                <p>¿Estas seguro de eliminar?</p>
                                <p className='text-amber-700 text-sm mt-2'>* Se eliminara el elemento seleccionado con sus datos asociados</p>
                            </div>

                            <div className='flex justify-center gap-5 mt-3'>
                                <button
                                    onClick={eliminarLote}
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


                {/* {mostrarModalEditarSector && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Editar Sector</h3>
                            <input
                                type="text"
                                value={nuevoNombreSector}
                                onChange={(e) => setNuevoNombreSector(e.target.value)}
                                placeholder="Nuevo nombre del sector"
                            />
                            <button onClick={guardarEdicionSector}>Guardar</button>
                            <button onClick={() => setMostrarModalEditarSector(false)}>Cancelar</button>
                        </div>
                    </div>
                )} */}


            </div>
        </div>
    );
}

export default Trazabilidad;



