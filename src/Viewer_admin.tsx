import React, { useState, useEffect } from 'react';
import * as OBC from "openbim-components";
import * as THREE from "three";
import { db } from '../firebase_config';
import { getDoc, getDocs, doc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { IoMdAddCircle } from 'react-icons/io';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { FaFilePdf } from "react-icons/fa6"; // Importa los íconos para "Apto" y "No apto"
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { SiReacthookform } from "react-icons/si";
import { FaQuestionCircle } from "react-icons/fa";
import jsPDF from 'jspdf';
import logo from './assets/tpf_logo_azul.png'
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormularioInspeccion from './Components/FormularioInspeccion';
import Trazabilidad from './Pages/Administrador/Trazabilidad'
import TrazabilidadBim from './Pages/Administrador/TrazabiidadBim';
import { div } from 'three/examples/jsm/nodes/Nodes.js';
import ViewerComponent from './ViewerComponent';


interface Lote {
    docId: string;
    nombre: string;
    sectorNombre: string;
    subSectorNombre: string;
    parteNombre: string;
    elementoNombre: string;
    loteNombre: string;
    ppiNombre: string;
    globalId: string;
}

export default function ViewerAdmin() {
    const [modelCount, setModelCount] = useState(0);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null);
    const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
    const [inspecciones, setInspecciones] = useState([]);



    const titulo = "REGISTRO DE INSPECCIÓN DE OBRA REV-1"

    const imagenPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Adif_wordmark.svg/1200px-Adif_wordmark.svg.png"
    const imagenPath2 = logo
    const [nombreProyecto, setNombreProyecto] = useState(localStorage.getItem('nombre_proyecto') || '');
    const [obra, setObra] = useState(localStorage.getItem('obra'));
    const [tramo, setTramo] = useState(localStorage.getItem('tramo'));
    const [observaciones, setObservaciones] = useState('');
    const idLote = localStorage.getItem('loteId');

    const navigate = useNavigate();
    const [ppi, setPpi] = useState(null);


    // En ViewerComponent
    const actualizarLotesDesdeHijo = (nuevoLote) => {
        console.log(nuevoLote, 'nuevo lote******')
        setLotes((lotesActuales) => [...lotesActuales, nuevoLote]);
        setSelectedLote(nuevoLote)

    };

    useEffect(() => {
        obtenerLotes();
    }, []); // Asegúrate de que se carga una vez
    
    useEffect(() => {
        if (selectedGlobalId) {
            const lote = lotes.find(l => l.globalId === selectedGlobalId);
            setSelectedLote(lote || null);
        }
    }, [selectedGlobalId, lotes]); // Reactiva a cambios en selectedGlobalId y lotes
    
  

    const obtenerLotes = async () => {
        try {
            const lotesRef = collection(db, "lotes");
            const querySnapshot = await getDocs(lotesRef);
            const lotesData = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data(),
            })) as Lote[];
            setLotes(lotesData);
        } catch (error) {
            console.error('Error al obtener los lotes:', error);
        }
    };
    


    // useEffect(() => {
    //     let viewer = new OBC.Components();

    //     const viewerContainer = document.getElementById("viewerContainer");
    //     if (!viewerContainer) {
    //         console.error("Viewer container not found.");
    //         return;
    //     }

    //     const sceneComponent = new OBC.SimpleScene(viewer);
    //     sceneComponent.setup();
    //     viewer.scene = sceneComponent;

    //     const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer);
    //     viewer.renderer = rendererComponent;

    //     const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
    //     viewer.camera = cameraComponent;

    //     const raycasterComponent = new OBC.SimpleRaycaster(viewer);
    //     viewer.raycaster = raycasterComponent;

    //     viewer.init();
    //     cameraComponent.updateAspect();
    //     rendererComponent.postproduction.enabled = true;

    //     const grid = new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));
    //     rendererComponent.postproduction.customEffects.excludedMeshes.push(grid.get());

    //     const fragmentManager = new OBC.FragmentManager(viewer);
    //     const ifcLoader = new OBC.FragmentIfcLoader(viewer);

    //     const highlighter = new OBC.FragmentHighlighter(viewer);
    //     highlighter.setup();

    //     const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer);
    //     highlighter.events.select.onClear.add(() => {
    //         propertiesProcessor.cleanPropertiesList();
    //         setSelectedGlobalId(null);
    //     });

    //     ifcLoader.onIfcLoaded.add(model => {
    //         setModelCount(fragmentManager.groups.length);
    //         propertiesProcessor.process(model);
    //         highlighter.events.select.onHighlight.add((selection) => {
    //             const fragmentID = Object.keys(selection)[0];
    //             const expressID = Number([...selection[fragmentID]][0]);
    //             const properties = propertiesProcessor.getProperties(model, expressID.toString());
    //             if (properties) {
    //                 const globalIdProperty = properties.find(prop => prop.Name === 'GlobalId' || (prop.GlobalId && prop.GlobalId.value));
    //                 const globalId = globalIdProperty ? globalIdProperty.GlobalId.value : 'No disponible';
    //                 setSelectedGlobalId(globalId);
    //                 const lote = lotes.find(l => l.globalId === globalId);

    //                 if (lote) {
    //                     setSelectedLote(lote);
    //                     localStorage.setItem('loteId', lote.docId);
    //                     // Asumiendo que esta función es asincrónica y está definida en otro lugar
    //                 } else {
    //                     setSelectedLote(null);
    //                     setInspecciones([]);
    //                     localStorage.removeItem('loteId');
    //                 }
    //             }
    //         });
    //         highlighter.update();
    //     });

    //     const mainToolbar = new OBC.Toolbar(viewer);
    //     mainToolbar.addChild(
    //         ifcLoader.uiElement.get("main"),
    //         propertiesProcessor.uiElement.get("main")
    //     );
    //     viewer.ui.addToolbar(mainToolbar);

    //     return () => {
    //         if (viewer) {
    //             viewer.dispose();
    //         }
    //     };
    // }, [lotes]);


    // const viewerContainerStyle: React.CSSProperties = {
    //     width: "100%",
    //     height: "400px",
    //     position: "relative",
    //     gridArea: "viewer",

    // }

    // const titleStyle: React.CSSProperties = {
    //     position: "absolute",
    //     top: "15px",
    //     left: "15px"
    // }

    // const imagesContainerStyle: React.CSSProperties = {
    //     position: 'absolute',
    //     top: '60px',
    //     left: '15px'
    // };




    const regresar = () => {
        navigate(-1); // Regresa a la página anterior
    };





    const [seleccionApto, setSeleccionApto] = useState({});
    const [tempSeleccion, setTempSeleccion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalFormulario, setModalFormulario] = useState(false);
    const [currentSubactividadId, setCurrentSubactividadId] = useState(null);











    const handleCloseModal = () => {
        setModal(false)
        setModalFormulario(false)
     



    };












    const [modalInforme, setModalInforme] = useState(false)
    const [modalConfirmacionInforme, setModalConfirmacionInforme] = useState(false)

    const confirmarInforme = () => {
        setModalInforme(true)
        handleCloseModal()
    }

    const closeModalConfirmacion = () => {
        setModalInforme(false)
        setFormulario(false)
    }

    const confirmarModalInforme = () => {
        setModalConfirmacionInforme(true)
        handleCloseModal()
        setModalInforme(false)

    }











    const [loteInfo, setLoteInfo] = useState(null); // Estado para almacenar los datos del PPI
    const [sectorInfoLote, setSectorInfoLote] = useState(null); // Estado para almacenar los datos del PPI
    useEffect(() => {
        const obtenerLotePorId = async () => {
            console.log('********** id lote', idLote)
            if (!idLote) return; // Verifica si idLote está presente

            try {
                const docRef = doc(db, "lotes", idLote); // Crea una referencia al documento usando el id
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {

                    setLoteInfo({ id: docSnap.id, ...docSnap.data() });

                } else {
                    console.log("No se encontró el lote con el ID:", idLote);

                }
            } catch (error) {
                console.error("Error al obtener el lote:", error);

            }
        };

        obtenerLotePorId();
    }, [idLote]);



    const [mensajeExitoInspeccion, setMensajeExitoInspeccion] = useState('')
    const [modalExito, setModalExito] = useState(false)




    const actualizarLoteConGlobalId = async (loteId, globalId) => {
        const loteRef = doc(db, "lotes", loteId);
        try {
            await updateDoc(loteRef, { globalId: globalId });
            // Actualizar el estado del lote seleccionado inmediatamente
            const updatedLote = { ...selectedLote, globalId: globalId };
            setSelectedLote(updatedLote);
            
            // Actualizar la lista de lotes
            const updatedLotes = lotes.map(lote => lote.docId === loteId ? { ...lote, globalId: globalId } : lote);
            setLotes(updatedLotes);
    
            setSuccessMessage("Global ID agregado correctamente al lote.");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error actualizando el lote con GlobalId:", error);
            setSuccessMessage("Error al agregar Global ID.");
            setShowSuccessModal(true);
        }
    };
    
    

    const handleSelectLote = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const loteId = e.target.value;
        const lote = lotes.find(l => l.docId === loteId);
        setSelectedLote(lote || null);
    };
 

    const [showSuccessModal, setShowSuccessModal] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

    return (

        <div className="min-h-screen text-gray-500 px-14 py-5">
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className=' text-gray-500'>Inicio</h1>
                </Link>

                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />

                <h1 className='cursor-pointer text-gray-500' onClick={regresar}>Elementos</h1>

                <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Ppi: </h1>
                </Link>
                <p>admin</p>

            </div>


            <div className='grid grid-cols-2 gap-4 mt-4'>



                <div className=''>
                    <div className="bg-white rounded-lg mb-4">
                        <div className="bg-gray-200 px-4 py-2 font-bold text-gray-500 rounded-t-lg">Global id seleccionado</div>
                        <div className='text-sm px-4 py-3'>
                            <span className='text-amber-600 font-medium'>{selectedGlobalId}</span>

                        </div>
                    </div>


                    <div className="bg-white rounded-lg mb-4">
                        <div className="bg-gray-200 px-4 py-2 font-bold text-gray-500 rounded-t-lg">Lotes disponibles</div>
                        <div className='text-sm px-4 py-3'>
                            <select onChange={handleSelectLote} value={selectedLote?.docId || ""}
                                className="block w-full mt-1 p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                <option value="">Seleccione un lote</option>
                                {lotes.map((lote) => (
                                    <option key={lote.docId} value={lote.docId}
                                        className={`${!lote.globalId ? 'bg-amber-600 text-white' : 'bg-white text-black'}`}>
                                        {lote.nombre}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>




                    {/* Columna 2: Información y Acciones del Lote Seleccionado */}
                    <div className='bg-gray-200 rounded-lg shadow my-5'>

                        {selectedLote ? (
                            <>
                                <div className="bg-gray-100 rounded-lg">
                                    <div className="bg-gray-200 px-4 py-2 font-bold text-gray-500 rounded-t-lg">Información del Lote</div>
                                    <div className='text-sm px-4 py-2'>
                                        <div className="flex items-center justify-between">
                                            <p className={`font-medium ${selectedLote?.globalId ? 'text-green-600' : 'text-gray-500'}`}>
                                                <strong>Global ID Bim:</strong> {selectedLote?.globalId || "Sin asignar"}
                                            </p>
                                            {selectedLote?.globalId ? (
                                                <button className="px-4 py-2 rounded-lg text-green-600 font-bold">ID Asignado</button>
                                            ) : (
                                                <button
                                                    onClick={() => selectedLote && selectedGlobalId && actualizarLoteConGlobalId(selectedLote.docId, selectedGlobalId)}
                                                    className={`px-4 py-2 rounded text-white ${selectedGlobalId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-500 cursor-not-allowed'}`}
                                                    disabled={!selectedLote || !selectedGlobalId}>
                                                    Agregar Global ID
                                                </button>
                                            )}
                                        </div>
                                        <p className='border-b p-1 font-semibold text-sky-600'><strong>Lote:</strong> {selectedLote.nombre}</p>
                                        <p className='border-b p-1 font-semibold text-sky-600'><strong>Ppi:</strong> {selectedLote.ppiNombre}</p>
                                        <p className='border-b p-1'><strong>Sector:</strong> {selectedLote.sectorNombre}</p>
                                        <p className='border-b p-1'><strong>Sub sector:</strong> {selectedLote.subSectorNombre}</p>
                                        <p className='border-b p-1'><strong>Parte:</strong> {selectedLote.parteNombre}</p>
                                        <p className='border-b p-1'><strong>Elemento:</strong> {selectedLote.elementoNombre}</p>
                                    </div>
                                </div>


                            </>
                        ) : (
                            <div className="p-5">
                                <p className="text-gray-700">Selecciona un lote para ver o asignar un Global ID.</p>
                            </div>
                        )}
                    </div>
                </div>


                <div>
                <ViewerComponent onModelLoad={setSelectedGlobalId}/>
                </div>


            </div>










            {modalExito && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-90"></div>

                    <div className="mx-auto w-[400px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8 text-center flex flex-col gap-5 items-center"
                    >
                        <button
                            onClick={() => setModalExito(false)}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300">
                            <IoCloseCircle />
                        </button>

                        <p className='text-teal-500 font-bold text-5xl'><FaCheckCircle /></p>

                        <p className='text-xl font-bold'>{mensajeExitoInspeccion}</p>



                    </div>

                </div>
            )}


            {showSuccessModal && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-50"></div>

                    <div className="modal-container bg-white w-1/4 rounded shadow-lg z-50 overflow-y-auto p-3">
                        <div className="text-right p-2">
                            <button onClick={() => setShowSuccessModal(false)} className="text-3xl font-semibold hover:text-red-500 transition ease-in-out duration-300">
                                &times;
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center">
                            <FaCheckCircle size="60" className="text-green-500 mb-5" />
                            <p className="text-center text-gray-800 text-xl font-medium mt-3">{successMessage}</p>
                           
                        </div>
                    </div>
                </div>
            )}




        </div>
    );
}
