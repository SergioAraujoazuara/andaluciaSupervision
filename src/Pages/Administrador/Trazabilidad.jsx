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
import { VscEdit } from "react-icons/vsc";
import { RiDeleteBinLine } from "react-icons/ri";
import { IoArrowBackCircle } from "react-icons/io5";
import { GrSave } from "react-icons/gr";
import { SiBim } from "react-icons/si";
import { useNavigate } from 'react-router-dom';
import { FaArrowAltCircleRight } from "react-icons/fa";


function Trazabilidad() {

    const navigate = useNavigate();
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
    const [pkInicialInput, setPkInicialInput] = useState('');
    const [pkFinalInput, setPkFinalInput] = useState('');
    const [selectedLote, setSelectedLote] = useState('');
    const [idBimInput, setIdBimInput] = useState('');


    const [objetoLote, setObjetoLote] = useState({})


    //alertas 
    const [alerta, setAlerta] = useState('');
    const [tipoAlerta, setTipoAlerta] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);


    const handleGoBack = () => {
        navigate(-1); // Esto navega hacia atrás en la historia
    };

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

            // Asume que 'ppi' es tu objeto con toda la información del PPI que quieres guardar
            const ppiSeleccionado = ppis.find(ppi => ppi.id === selectedPpi);

            // Verifica que ppiSeleccionado no sea undefined antes de proceder
            if (!ppiSeleccionado) {
                console.error('PPI seleccionado no encontrado.');
                setAlerta('Error al encontrar el PPI seleccionado.');
                setTipoAlerta('error');
                setMostrarModal(true);
                return;
            }

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
                pkInicial: pkInicialInput, // Incluir pkInicial
                pkFinal: pkFinalInput,
                idBim: idBimInput,
                estado: 'pendiente',
                totalSubactividades: ppiSeleccionado.totalSubactividades || 0,
            };

            // Referencia a la subcolección específica y añade el nuevo lote
            const loteSubColeccionRef = doc(db, `proyectos/${id}/sector/${selectedSector}/subsector/${selectedSubSector}/parte/${selectedParte}/elemento/${elementoId}/lote/${loteId}`);
            await setDoc(loteSubColeccionRef, nuevoLote);

            // Referencia a la colección principal y añade el nuevo lote
            const lotePrincipalRef = doc(db, `lotes/${loteId}`);
            await setDoc(lotePrincipalRef, nuevoLote);

            // Crear la subcolección 'inspecciones' dentro del lote recién creado
            // y agregar el objeto ppiSeleccionado como documento
            const inspeccionRef = doc(collection(db, `lotes/${loteId}/inspecciones`));
            await setDoc(inspeccionRef, ppiSeleccionado);
            // Limpia los campos y muestra alerta de éxito
            setLoteInput('');
            setSelectedPpi('');
            setPkInicialInput('');
            setPkFinalInput('');
            setIdBimInput('');
            setAlerta('Lote agregado correctamente');
            setTipoAlerta('success');
            setMostrarModal(true);

            function estimatedDocumentSize(obj) {
                const stringSize = (s) => new Blob([s]).size;
                let size = 0;

                const recurse = (obj) => {
                    if (obj !== null && typeof obj === 'object') {
                        Object.entries(obj).forEach(([key, value]) => {
                            size += stringSize(key);
                            if (typeof value === 'string') {
                                size += stringSize(value);
                            } else if (typeof value === 'boolean') {
                                size += 4;
                            } else if (typeof value === 'number') {
                                size += 8;
                            } else if (Array.isArray(value) || typeof value === 'object') {
                                recurse(value);
                            }
                        });
                    } else if (typeof obj === 'string') {
                        size += stringSize(obj);
                    }
                };

                recurse(obj);

                return size;
            }


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


    // EDICION TRAZABILIDAD

    /// SECTOR ///
    const [sectorIdAEditar, setSectorIdAEditar] = useState(null);
    const [nuevoNombreSector, setNuevoNombreSector] = useState('');
    const [mostrarModalEditarSector, setMostrarModalEditarSector] = useState(false);

    // Función para solicitar la edición de un sector
    const solicitarEditarSector = (sectorId, nombreActual) => {
        setSectorIdAEditar(sectorId);
        setNuevoNombreSector(nombreActual);
        setMostrarModalEditarSector(true);
    };

    // Función para guardar la edición de un sector
    const guardarEdicionSector = async () => {
        if (!nuevoNombreSector.trim()) {
            setAlerta('El nombre no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            const docRef = doc(db, `proyectos/${id}/sector`, sectorIdAEditar);
            await updateDoc(docRef, { nombre: nuevoNombreSector });

            const sectoresActualizados = sectores.map(sector =>
                sector.id === sectorIdAEditar ? { ...sector, nombre: nuevoNombreSector } : sector
            );

            setSectores(sectoresActualizados);
            setAlerta('Sector actualizado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al actualizar el sector:', error);
            setAlerta('Error al actualizar el sector.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEditarSector(false);
        setSectorIdAEditar('');
        setNuevoNombreSector('');
    };



    /// SUB SECTOR ///
    const [subSectorIdAEditar, setSubSectorIdAEditar] = useState(null);
    const [nuevoNombreSubSector, setNuevoNombreSubSector] = useState('');
    const [mostrarModalEditarSubSector, setMostrarModalEditarSubSector] = useState(false);


    // Función para solicitar la edición de un subsector
    const solicitarEditarSubSector = (sectorId, subSectorId, nombreActual) => {
        setSectorIdAEditar(sectorId);
        setSubSectorIdAEditar(subSectorId);
        setNuevoNombreSubSector(nombreActual);
        setMostrarModalEditarSubSector(true);
    };

    // Función para guardar la edición de un subsector
    const guardarEdicionSubSector = async () => {
        if (!nuevoNombreSubSector.trim()) {
            setAlerta('El nombre no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            const docRef = doc(db, `proyectos/${id}/sector/${sectorIdAEditar}/subsector`, subSectorIdAEditar);
            await updateDoc(docRef, { nombre: nuevoNombreSubSector });

            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEditar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector =>
                            subsector.id === subSectorIdAEditar ? { ...subsector, nombre: nuevoNombreSubSector } : subsector
                        )
                    };
                }
                return sector;
            });

            setSectores(sectoresActualizados);
            setAlerta('Subsector actualizado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al actualizar el subsector:', error);
            setAlerta('Error al actualizar el subsector.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEditarSubSector(false);
        setSectorIdAEditar('');
        setSubSectorIdAEditar('');
        setNuevoNombreSubSector('');
    };

    /// PARTE ///

    const [parteIdAEditar, setParteIdAEditar] = useState(null);
    const [nuevoNombreParte, setNuevoNombreParte] = useState('');
    const [mostrarModalEditarParte, setMostrarModalEditarParte] = useState(false);

    // Función para solicitar la edición de una parte
    const solicitarEditarParte = (sectorId, subSectorId, parteId, nombreActual) => {
        setSectorIdAEditar(sectorId);
        setSubSectorIdAEditar(subSectorId);
        setParteIdAEditar(parteId);
        setNuevoNombreParte(nombreActual);
        setMostrarModalEditarParte(true);
    };

    // Función para guardar la edición de una parte
    const guardarEdicionParte = async () => {
        if (!nuevoNombreParte.trim()) {
            setAlerta('El nombre no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            const docRef = doc(db, `proyectos/${id}/sector/${sectorIdAEditar}/subsector/${subSectorIdAEditar}/parte`, parteIdAEditar);
            await updateDoc(docRef, { nombre: nuevoNombreParte });

            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEditar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subSectorIdAEditar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.map(parte =>
                                        parte.id === parteIdAEditar ? { ...parte, nombre: nuevoNombreParte } : parte
                                    )
                                };
                            }
                            return subsector;
                        })
                    };
                }
                return sector;
            });

            setSectores(sectoresActualizados);
            setAlerta('Parte actualizada correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al actualizar la parte:', error);
            setAlerta('Error al actualizar la parte.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEditarParte(false);
        setSectorIdAEditar('');
        setSubSectorIdAEditar('');
        setParteIdAEditar('');
        setNuevoNombreParte('');
    };

    /// ELEMENTO /// 

    const [elementoIdAEditar, setElementoIdAEditar] = useState(null);
    const [nuevoNombreElemento, setNuevoNombreElemento] = useState('');
    const [mostrarModalEditarElemento, setMostrarModalEditarElemento] = useState(false);

    // Función para solicitar la edición de un elemento
    const solicitarEditarElemento = (sectorId, subSectorId, parteId, elementoId, nombreActual) => {
        setSectorIdAEditar(sectorId);
        setSubSectorIdAEditar(subSectorId);
        setParteIdAEditar(parteId);
        setElementoIdAEditar(elementoId);
        setNuevoNombreElemento(nombreActual);
        setMostrarModalEditarElemento(true);
    };

    // Función para guardar la edición de un elemento
    const guardarEdicionElemento = async () => {
        if (!nuevoNombreElemento.trim()) {
            setAlerta('El nombre no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            const docRef = doc(db, `proyectos/${id}/sector/${sectorIdAEditar}/subsector/${subSectorIdAEditar}/parte/${parteIdAEditar}/elemento`, elementoIdAEditar);
            await updateDoc(docRef, { nombre: nuevoNombreElemento });

            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEditar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subSectorIdAEditar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.map(parte => {
                                        if (parte.id === parteIdAEditar) {
                                            return {
                                                ...parte,
                                                elementos: parte.elementos.map(elemento =>
                                                    elemento.id === elementoIdAEditar ? { ...elemento, nombre: nuevoNombreElemento } : elemento
                                                )
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
            setAlerta('Elemento actualizado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al actualizar el elemento:', error);
            setAlerta('Error al actualizar el elemento.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEditarElemento(false);
        setSectorIdAEditar('');
        setSubSectorIdAEditar('');
        setParteIdAEditar('');
        setNuevoNombreParte('');
        setNuevoNombreElemento('');
    };


    /// LOTE ///

    const [mostrarModalEditarLote, setMostrarModalEditarLote] = useState(false);
    const [loteIdAEditar, setLoteIdAEditar] = useState(null);
    const [nuevoNombreLote, setNuevoNombreLote] = useState('');
    const [nuevoPkInicial, setNuevoPkInicial] = useState('');
    const [nuevoPkFinal, setNuevoPkFinal] = useState('');
    const [nuevoIdBim, setNuevoIdBim] = useState('');

    const solicitarEditarLote = (sectorId, subSectorId, parteId, elementoId, loteId, lote) => {
        setSectorIdAEditar(sectorId);
        setSubSectorIdAEditar(subSectorId);
        setParteIdAEditar(parteId);
        setElementoIdAEditar(elementoId);
        setLoteIdAEditar(loteId);
        setNuevoNombreLote(lote.nombre);
        setNuevoPkInicial(lote.pkInicial || '');
        setNuevoPkFinal(lote.pkFinal || '');
        setNuevoIdBim(lote.idBim || '');
        setMostrarModalEditarLote(true);
    };

    const guardarEdicionLote = async () => {
        if (!nuevoNombreLote.trim()) {
            setAlerta('El nombre no puede estar vacío.');
            setTipoAlerta('error');
            setMostrarModal(true);
            return;
        }

        try {
            const docRef = doc(db, `proyectos/${id}/sector/${sectorIdAEditar}/subsector/${subSectorIdAEditar}/parte/${parteIdAEditar}/elemento/${elementoIdAEditar}/lote`, loteIdAEditar);
            await updateDoc(docRef, {
                nombre: nuevoNombreLote,
                pkInicial: nuevoPkInicial,
                pkFinal: nuevoPkFinal,
                idBim: nuevoIdBim
            });

            const sectoresActualizados = sectores.map(sector => {
                if (sector.id === sectorIdAEditar) {
                    return {
                        ...sector,
                        subsectores: sector.subsectores.map(subsector => {
                            if (subsector.id === subSectorIdAEditar) {
                                return {
                                    ...subsector,
                                    partes: subsector.partes.map(parte => {
                                        if (parte.id === parteIdAEditar) {
                                            return {
                                                ...parte,
                                                elementos: parte.elementos.map(elemento => {
                                                    if (elemento.id === elementoIdAEditar) {
                                                        return {
                                                            ...elemento,
                                                            lotes: elemento.lotes.map(lote =>
                                                                lote.id === loteIdAEditar
                                                                    ? { ...lote, nombre: nuevoNombreLote, pkInicial: nuevoPkInicial, pkFinal: nuevoPkFinal, idBim: nuevoIdBim }
                                                                    : lote
                                                            )
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
            });

            setSectores(sectoresActualizados);
            setAlerta('Lote actualizado correctamente.');
            setTipoAlerta('success');
            setMostrarModal(true);
        } catch (error) {
            console.error('Error al actualizar el lote:', error);
            setAlerta('Error al actualizar el lote.');
            setTipoAlerta('error');
            setMostrarModal(true);
        }

        setMostrarModalEditarLote(false);
        setLoteIdAEditar('');
        setNuevoNombreLote('');
        setNuevoPkInicial('');
        setNuevoPkFinal('');
        setNuevoIdBim('');
    };





    return (
        <div className='container mx-auto min-h-screen py-2 xl:px-14 text-gray-500'>
            {/* Encabezado */}




            <div className='flex gap-2 items-center justify-between px-5 py-3 text-base'>

                <div className='flex items-center gap-2'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />

                    <Link to={'/admin'}>
                        <h1 className='text-gray-600'>Administración</h1>
                    </Link>

                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Trazabilidad </h1>
                    </Link>
                </div>
                



                <div className='flex items-center'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>

            </div>
            <div className='w-full border-b-2 border-gray-200'></div>


            {/* Contenido */}
            <div className='flex gap-3 flex-col mt-5 bg-white xl:p-4 px-4 rounded rounded-xl shadow-md'>



                {/* <div className='w-full border border-b-2'></div> */}


                {/* Formulario de trazabilidad */}
                <div>
                    <div className='grid grid-cols-24 gap-2 xl:gap-6 text-sm'>

                        <div className='col-span-24 xl:col-span-6'>
                            {/* Sector */}
                            <div className="flex flex-col items-start gap-3">
                                <p className='text-md bg-gray-200 font-medium text-gray-500 rounded-md px-3 py-2 flex items-center gap-2 w-full'>1. Sector</p>
                                <div className="flex flex-col xl:flex-row items-center w-full">
                                    <div className='w-full flex gap-2'>
                                        <input
                                            placeholder='Nuevo sector'
                                            type="text"
                                            className='border px-3 py-1 rounded-lg w-full'
                                            value={sectorInput}
                                            onChange={(e) => setSectorInput(e.target.value)}
                                        />
                                        <button
                                            onClick={agregarSector}
                                            className="flex justify-center w-40 xl:w-20  xl:ml-2 xl:mt-0 bg-sky-600 hover:bg-sky-600 text-white text-lg font-medium py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <IoMdAddCircle className='text-sm' />
                                        </button>
                                    </div>

                                </div>
                                <div className="flex flex-col items-start gap-3 w-full">

                                    <select
                                        id="sectores"
                                        className="border px-3 py-1 rounded-lg w-full"
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
                            {/* Sub Sector */}
                            <div className="flex flex-col col-span-4 items-start gap-3 mt-3">
                                <p className='text-md bg-gray-200 font-medium text-gray-500 w-full rounded-md px-3 py-2 flex items-center gap-2'>2. Sub sector</p>


                                <div className="flex flex gap-2 xl:flex-row items-center w-full">

                                    <input
                                        placeholder='Nuevo sub sector: '
                                        type="text"
                                        id="subsector"
                                        className='border px-3 py-1 rounded-lg w-full'
                                        value={subSectorInput}
                                        onChange={(e) => setSubSectorInput(e.target.value)}
                                    />
                                    <button
                                        onClick={() => agregarSubsector(selectedSector)}
                                        className="w-40 xl:w-20  flex justify-center xl:ml-2 bg-sky-600 hover:bg-sky-600 text-white text-lg font-medium py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <IoMdAddCircle className='text-sm' />
                                    </button>
                                </div>

                            </div>

                            <div className="flex flex-col items-start gap-3 w-full mt-3">

                                <select
                                    id="subsectores"
                                    className="border px-3 py-1 rounded-lg w-full"
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

                        {/* Parte */}

                        <div className='flex flex-col col-span-24 xl:col-span-6 gap-3  mt-4 xl:mt-0'>
                            <p className='text-md bg-gray-200 font-medium text-gray-500 w-full rounded-md px-3 py-2 flex items-center gap-2'>3. Parte</p>


                            <div className="flex gap-2 xl:flex-row items-center w-full">

                                <input
                                    placeholder='Nuevo parte: '
                                    type="text"
                                    id="parte"
                                    className='border px-3 py-1 rounded-lg w-full'
                                    value={parteInput}
                                    onChange={(e) => setParteInput(e.target.value)}
                                />
                                <button
                                    onClick={handleAgregarParte}
                                    className="w-40 xl:w-20  flex justify-center xl:ml-2  bg-sky-600 hover:bg-sky-600 text-white text-lg font-medium py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                >
                                    <IoMdAddCircle className='text-sm' />
                                </button>
                            </div>

                            <div className="flex flex-col items-start gap-3 w-full">

                                <select
                                    id="partes"
                                    className="border px-3 py-1 rounded-lg w-full"
                                    value={selectedParte}
                                    onChange={handleParteChange}
                                >
                                    <option value="">Seleccione una parte</option>
                                    {(sectores.find(sector => sector.id === selectedSector)?.subsectores.find(subsector => subsector.id === selectedSubSector)?.partes || []).map((parte) => (
                                        <option key={parte.id} value={parte.id}>{parte.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col col-span-24 xl:col-span-5 gap-3    mt-5 xl:mt-0'>
                                <p className='text-md bg-gray-200 font-medium text-gray-500 w-full rounded-md px-3 py-2 flex items-center gap-2'>4. Elemento</p>
                                <div className="flex gap-2 xl:flex-row items-center w-full">

                                    <input
                                        placeholder='Nuevo elemento: '
                                        type="text"
                                        id="elemento"
                                        className='border px-3 py-1 rounded-lg w-full'
                                        value={elementoInput}
                                        onChange={(e) => setElementoInput(e.target.value)}
                                    />
                                    <button
                                        onClick={() => agregarElemento(selectedParte)} // Asegúrate de tener un estado selectedParte para manejar la parte seleccionada
                                        className="w-40 xl:w-20  flex justify-center bg-sky-600 hover:bg-sky-600 text-white text-lg font-medium py-2 px-4 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                    >
                                        <IoMdAddCircle className='text-sm' />
                                    </button>
                                </div>

                                <div className="flex flex-col items-start gap-3 w-full">

                                    <select
                                        id="elementos"
                                        className="border px-3 py-1 rounded-lg w-full"
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
                        </div>






                        {/* Lote */}


                        <div className='flex flex-col col-span-24 xl:col-span-12 gap-3 mt-5 xl:mt-0 '>
                            <div className='text-start'>
                                <p className='text-md bg-gray-200 font-medium text-gray-500 w-full rounded-md px-3 py-2 flex items-center gap-2'>5. Lote y ppi</p>

                            </div>

                            <div className='grid xl:grid-cols-12 gap-3'>


                                <div className='flex flex-col gap-3 col-span-6'>

                                    <input
                                        placeholder='Nuevo lote: '
                                        type="text"
                                        id="lote"
                                        className='border px-3 py-1 rounded-lg w-full'
                                        value={loteInput}
                                        onChange={(e) => setLoteInput(e.target.value)}
                                    />

                                    <select
                                        value={selectedPpi}
                                        onChange={(e) => setSelectedPpi(e.target.value)}
                                        className="border px-3 py-1 rounded-lg w-full"
                                    >
                                        <option value="">Seleccione un PPI</option>
                                        {ppis.map(ppi => (
                                            <option key={ppi.id} value={ppi.id}>{ppi.nombre}</option>
                                        ))}
                                    </select>

                                    <input
                                        placeholder='Pk inicial: '
                                        type="text"
                                        id="pkInicial"
                                        className='border px-3 py-1 rounded-lg w-full'
                                        value={pkInicialInput}
                                        onChange={(e) => setPkInicialInput(e.target.value)}
                                    />
                                    <input
                                        placeholder='Pk final: '
                                        type="text"
                                        id="pkFinal"
                                        className='border px-3 py-1 rounded-lg w-full'
                                        value={pkFinalInput}
                                        onChange={(e) => setPkFinalInput(e.target.value)}
                                    />
                                    <div className="flex items-center">
                                        <input
                                            placeholder='GlobalID (Opcional)'
                                            type="text"
                                            className='border px-3 py-1 rounded-lg w-full'
                                            value={idBimInput}
                                            onChange={(e) => setIdBimInput(e.target.value)}
                                        />
                                    </div>
                                </div>




                                <div className=' col-span-6 xl:px-5'>
                                    <p className='font-medium flex items-center gap-3'><span className='text-amber-600'>*</span>Para guardar trazabilidad selecciona un item en el desplegable y posteriormente agrega la información en cada campo.</p>

                                    <div className='flex gap-6'>
                                        <button
                                            onClick={() => agregarLote(selectedElemento)}
                                            className="w-60 xl:h-14 h-10 text-white xl:px-8 mt-4 flex justify-center items-center gap-3 font-semibold bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"
                                        >
                                            <span className='text-white text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                                            Guardar trazabilidad
                                        </button>



                                        <Link to={'/visorAdmin'}>
                                            <button className="w-20 xl:w-20 xl:h-14 h-10 text-white text-3xl mt-4 flex justify-center items-center gap-3 font-semibold bg-sky-600 hover:bg-sky-600 rounded-xl shadow-md transition duration-300 ease-in-out  hover:shadow-lg hover:-translate-y-1"><SiBim /></button></Link>
                                        
                                    </div>
                                    <p className=' flex items-center gap-2 mt-4'><span className='text-amber-600 text-xl'> *</span>Asigna el globalId dentro del modelo BIM</p>


                                </div>




                            </div>








                        </div>





                    </div>
                </div>
                
                <div className="mt-5">
                    <div className="hidden xl:flex bg-gray-200 rounded-t-lg font-medium">
                        <p className="px-4 py-2 w-1/5">Sector</p>
                        <p className="px-4 py-2 w-1/5">Sub sector</p>
                        <p className="px-4 py-2 w-1/5">Parte</p>
                        <p className="px-4 py-2 w-1/5">Elemento</p>
                        <p className="px-4 py-2 w-1/5">Lote y ppi</p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {sectores.map((sector, index) => (
                            <div
                                key={sector.id}
                                className={`flex flex-wrap items-center ${index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'} md:flex-row flex-col`}
                            >
                                <div className="xl:bg-transparent bg-sky-600 rounded-t-lg text-gray-100 xl:text-gray-500 font-medium px-4 py-3 md:w-1/5 w-full group cursor-pointer flex justify-between">
                                    <p className='w-full text-lg'>{sector.nombre}</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => solicitarEditarSector(sector.id, sector.nombre)}
                                            className="text-gray-100 xl:text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        >
                                            <VscEdit />
                                        </button>
                                        <button
                                            onClick={() => solicitarEliminarSector(sector.id)}
                                            className="text-amber-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        >
                                            <RiDeleteBinLine />
                                        </button>
                                    </div>
                                </div>
                                {sector.subsectores && sector.subsectores.length > 0 && (
                                    <ul className="divide-y divide-gray-200 md:w-4/5 w-full">
                                        {sector.subsectores.map((subsector) =>
                                            subsector.partes && subsector.partes.length > 0
                                                ? subsector.partes.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((parte) =>
                                                    parte.elementos && parte.elementos.length > 0
                                                        ? parte.elementos.map((elemento) =>
                                                            elemento.lotes && elemento.lotes.length > 0
                                                                ? elemento.lotes.map((lote) => (
                                                                    <li
                                                                        key={lote.id}
                                                                        className="py-4 p-4 mb-4 md:mb-0 md:grid md:grid-cols-4"
                                                                    >
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{subsector.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        solicitarEditarSubSector(sector.id, subsector.id, subsector.nombre)
                                                                                    }
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)}
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{parte.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        solicitarEditarParte(sector.id, subsector.id, parte.id, parte.nombre)
                                                                                    }
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)}
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{elemento.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        solicitarEditarElemento(sector.id, subsector.id, parte.id, elemento.id, elemento.nombre)
                                                                                    }
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() =>
                                                                                        confirmarDeleteElemento(sector.id, subsector.id, parte.id, elemento.id)
                                                                                    }
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col justify-center">
                                                                            <p className="font-medium">Lote: {lote.nombre}</p>
                                                                            <div className="flex justify-between">
                                                                                <div>
                                                                                    <p className={`${lote.ppiNombre ? 'text-green-500' : 'text-red-500'}`}>
                                                                                        {lote.ppiNombre ? <p>PPI: {lote.ppiNombre}</p> : 'Ppi sin Asignar'}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="flex gap-4 group">
                                                                                    {lote.ppiId && (
                                                                                        <div className="flex gap-4">
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    solicitarEditarLote(sector.id, subsector.id, parte.id, elemento.id, lote.id, lote)
                                                                                                }
                                                                                                className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                            >
                                                                                                <VscEdit />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={() =>
                                                                                                    confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)
                                                                                                }
                                                                                                className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                            >
                                                                                                <RiDeleteBinLine />
                                                                                            </button>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                ))
                                                                : (
                                                                    <li
                                                                        key={`${elemento.id}-sin-lote`}
                                                                        className="py-4  rounded-lg p-4 mb-4 md:mb-0 md:grid md:grid-cols-4"
                                                                    >
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{subsector.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() => solicitarEditarSubSector(sector.id, subsector.id, subsector.nombre)}
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)}
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{parte.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() => solicitarEditarParte(sector.id, subsector.id, parte.id, parte.nombre)}
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)}
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex justify-between items-center group">
                                                                            <p>{elemento.nombre}</p>
                                                                            <div className="flex gap-4">
                                                                                <button
                                                                                    onClick={() =>
                                                                                        solicitarEditarElemento(sector.id, subsector.id, parte.id, elemento.id, elemento.nombre)
                                                                                    }
                                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <VscEdit />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => confirmarDeleteElemento(sector.id, subsector.id, parte.id, elemento.id)}
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col justify-center">
                                                                            <div className="flex justify-between">
                                                                                <div>
                                                                                    <p>-</p>
                                                                                    <p className="text-red-500">-</p>
                                                                                </div>
                                                                                <div className="flex gap-4 group">
                                                                                    {lote.ppiId && (
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)
                                                                                            }
                                                                                            className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                        >
                                                                                            <RiDeleteBinLine />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                )
                                                        )
                                                        : (
                                                            <li
                                                                key={`${parte.id}-sin-elemento`}
                                                                className="py-4 rounded-lg p-4 mb-4 md:mb-0 md:grid md:grid-cols-4"
                                                            >
                                                                <div className="flex justify-between items-center group">
                                                                    <p>{subsector.nombre}</p>
                                                                    <div className="flex gap-4">
                                                                        <button
                                                                            onClick={() => solicitarEditarSubSector(sector.id, subsector.id, subsector.nombre)}
                                                                            className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                        >
                                                                            <VscEdit />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)}
                                                                            className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                        >
                                                                            <RiDeleteBinLine />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between items-center group">
                                                                    <p>{parte.nombre}</p>
                                                                    <div className="flex gap-4">
                                                                        <button
                                                                            onClick={() => solicitarEditarParte(sector.id, subsector.id, parte.id, parte.nombre)}
                                                                            className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                        >
                                                                            <VscEdit />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => confirmarDeleteParte(sector.id, subsector.id, parte.id)}
                                                                            className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                        >
                                                                            <RiDeleteBinLine />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="px-4 ">-</p>
                                                                <div className="flex flex-col justify-center">
                                                                    <div className="flex justify-between">
                                                                        <div>
                                                                            <p>-</p>
                                                                            <p className="text-red-500">-</p>
                                                                        </div>
                                                                        <div className="flex gap-4 group">
                                                                            {lote.ppiId && (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)
                                                                                    }
                                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                                >
                                                                                    <RiDeleteBinLine />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )
                                                )
                                                : (
                                                    <li
                                                        key={`${subsector.id}-sin-parte`}
                                                        className="py-4 rounded-lg p-4 mb-4 md:mb-0 md:grid md:grid-cols-4"
                                                    >
                                                        <div className="flex justify-between items-center group">
                                                            <p>{subsector.nombre}</p>
                                                            <div className="flex gap-4">
                                                                <button
                                                                    onClick={() => solicitarEditarSubSector(sector.id, subsector.id, subsector.nombre)}
                                                                    className="text-gray-500 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                >
                                                                    <VscEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => confirmarDeleteSubSector(sector.id, subsector.id)}
                                                                    className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                >
                                                                    <RiDeleteBinLine />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="px-4 ">-</p>
                                                        <p className="px-4 ">-</p>
                                                        <div className="flex flex-col justify-center">
                                                            <div className="flex justify-between">
                                                                <div>
                                                                    <p>-</p>
                                                                    <p className="text-red-500">-</p>
                                                                </div>
                                                                <div className="flex gap-4 group">
                                                                    {lote.ppiId && (
                                                                        <button
                                                                            onClick={() =>
                                                                                confirmarDeleteLote(sector.id, subsector.id, parte.id, elemento.id, lote.id)
                                                                            }
                                                                            className="text-amber-600 text-md opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                                        >
                                                                            <RiDeleteBinLine />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )
                                        )}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>




                </div>






                {mostrarModalEliminarSubSector && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white xl:max-w-xl mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

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

                        <div className="modal-container bg-white xl:max-w-xl mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

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

                        <div className="modal-container bg-white xl:max-w-xl mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

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

                        <div className="modal-container bg-white xl:max-w-xl mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

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

                        <div className="modal-container bg-white xl:max-w-xl mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">

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
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                                            {/* Success or Error Icon */}
                                            {tipoAlerta === 'success' ?
                                                <IoIosCheckmarkCircle className='text-6xl text-green-600' /> :
                                                <IoCloseCircle className='text-6xl text-red-600' />
                                            }
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {tipoAlerta === 'success' ? 'Éxito' : 'Error'}
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    {alerta}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={handleCloseAlert}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {mostrarModalPpi && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" style={{ width: '320px', height: 'auto', maxWidth: '100%' }}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
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
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-500 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={handleCloseModalPpi}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {mostrarModalEditarSector && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">
                            <button onClick={() => setMostrarModalEditarSector(false)} className="text-2xl w-full flex justify-end text-gray-500">
                                <IoCloseCircle />
                            </button>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Sector</h3>
                                <input
                                    type="text"
                                    value={nuevoNombreSector}
                                    onChange={(e) => setNuevoNombreSector(e.target.value)}
                                    placeholder="Nuevo nombre del sector"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <div className='flex justify-center gap-5 mt-3'>
                                    <button
                                        onClick={guardarEdicionSector}
                                        className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setMostrarModalEditarSector(false)}
                                        className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEditarSubSector && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">
                            <button onClick={() => setMostrarModalEditarSubSector(false)} className="text-2xl w-full flex justify-end text-gray-500">
                                <IoCloseCircle />
                            </button>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Subsector</h3>
                                <input
                                    type="text"
                                    value={nuevoNombreSubSector}
                                    onChange={(e) => setNuevoNombreSubSector(e.target.value)}
                                    placeholder="Nuevo nombre del subsector"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <div className='flex justify-center gap-5 mt-3'>
                                    <button
                                        onClick={guardarEdicionSubSector}
                                        className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setMostrarModalEditarSubSector(false)}
                                        className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEditarParte && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">
                            <button onClick={() => setMostrarModalEditarParte(false)} className="text-2xl w-full flex justify-end text-gray-500">
                                <IoCloseCircle />
                            </button>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Parte</h3>
                                <input
                                    type="text"
                                    value={nuevoNombreParte}
                                    onChange={(e) => setNuevoNombreParte(e.target.value)}
                                    placeholder="Nuevo nombre de la parte"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <div className='flex justify-center gap-5 mt-3'>
                                    <button
                                        onClick={guardarEdicionParte}
                                        className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setMostrarModalEditarParte(false)}
                                        className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEditarElemento && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">
                            <button onClick={() => setMostrarModalEditarElemento(false)} className="text-2xl w-full flex justify-end text-gray-500">
                                <IoCloseCircle />
                            </button>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Elemento</h3>
                                <input
                                    type="text"
                                    value={nuevoNombreElemento}
                                    onChange={(e) => setNuevoNombreElemento(e.target.value)}
                                    placeholder="Nuevo nombre del elemento"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <div className='flex justify-center gap-5 mt-3'>
                                    <button
                                        onClick={guardarEdicionElemento}
                                        className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setMostrarModalEditarElemento(false)}
                                        className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {mostrarModalEditarLote && (
                    <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                        <div className="modal-overlay absolute w-full h-full bg-gray-900 opacity-80"></div>

                        <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto p-4 text-center font-medium">
                            <button onClick={() => setMostrarModalEditarLote(false)} className="text-2xl w-full flex justify-end text-gray-500">
                                <IoCloseCircle />
                            </button>
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Lote</h3>
                                <input
                                    type="text"
                                    value={nuevoNombreLote}
                                    onChange={(e) => setNuevoNombreLote(e.target.value)}
                                    placeholder="Nuevo nombre del lote"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <input
                                    type="text"
                                    value={nuevoPkInicial}
                                    onChange={(e) => setNuevoPkInicial(e.target.value)}
                                    placeholder="Nuevo PK Inicial"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <input
                                    type="text"
                                    value={nuevoPkFinal}
                                    onChange={(e) => setNuevoPkFinal(e.target.value)}
                                    placeholder="Nuevo PK Final"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />
                                <input
                                    type="text"
                                    value={nuevoIdBim}
                                    onChange={(e) => setNuevoIdBim(e.target.value)}
                                    placeholder="Nuevo GlobalID"
                                    className="mt-2 border px-3 py-1 rounded-lg w-full"
                                />


                                <div className='flex justify-center gap-5 mt-3'>
                                    <button
                                        onClick={guardarEdicionLote}
                                        className='bg-amber-600 hover:bg-amber-700 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => setMostrarModalEditarLote(false)}
                                        className='bg-gray-500 hover:bg-gray-600 text-white text-xs px-4 py-2 rounded-lg'
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}









            </div>
        </div>
    );
}

export default Trazabilidad;



