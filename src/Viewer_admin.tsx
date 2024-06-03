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
import { IoArrowBackCircle } from "react-icons/io5";


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

export default function Viewer_admin() {

    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('-1'); // Esto navega hacia atrás en la historia
    };
    const [modelCount, setModelCount] = useState(0);
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null);
    const [selectedNameBim, setSelectedNameBim] = useState<string | null>(null);
    const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
    const [inspecciones, setInspecciones] = useState([]);
    const idProyecto = localStorage.getItem('proyecto')



    const titulo = "REGISTRO DE INSPECCIÓN DE OBRA REV-1"

    const imagenPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Adif_wordmark.svg/1200px-Adif_wordmark.svg.png"
    const imagenPath2 = logo
    const [nombreProyecto, setNombreProyecto] = useState(localStorage.getItem('nombre_proyecto') || '');
    const [obra, setObra] = useState(localStorage.getItem('obra'));
    const [tramo, setTramo] = useState(localStorage.getItem('tramo'));
    const [observaciones, setObservaciones] = useState('');
    const idLote = localStorage.getItem('loteId');


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




    const actualizarLoteConGlobalId = async (loteId, globalId, nameBim) => {
        const loteRef = doc(db, "lotes", loteId);
        try {
            await updateDoc(loteRef, {
                globalId: globalId,
                nameBim: nameBim  // Agregar nameBim a la base de datos.
            });
            // Actualizar el estado del lote seleccionado inmediatamente
            const updatedLote = { ...selectedLote, globalId: globalId, nameBim: nameBim };
            setSelectedLote(updatedLote);

            // Actualizar la lista de lotes
            const updatedLotes = lotes.map(lote => lote.docId === loteId ? { ...lote, globalId: globalId, nameBim: nameBim } : lote);
            setLotes(updatedLotes);

            setSuccessMessage("Global ID y Nombre BIM agregados correctamente");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error actualizando el lote con GlobalId y NameBim:", error);
            setSuccessMessage("Error al agregar Global ID y Nombre BIM.");
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

    const [filtro, setFiltro] = useState("todos"); // 'todos', 'asignados', 'noAsignados'



    const handleFiltroChange = (event) => {
        setFiltro(event.target.value);
    };

    const lotesFiltrados = lotes.filter((lote) => {
        if (filtro === "todos") return true;
        if (filtro === "asignados") return lote.globalId;
        if (filtro === "noAsignados") return !lote.globalId;
    });


    return (

        <div className="container mx-auto min-h-screen text-gray-500 px-14 py-5">
            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>

                <div className='flex items-center gap-2'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />

                    <Link to={'/admin'}>
                        <h1 className='text-gray-600 cursor-pointer'>Administración</h1>
                    </Link>

                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={`/trazabilidad/${idProyecto}`}>
                        <h1 className='font-medium text-gray-500 cursor-pointer'>Trazabilidad </h1>
                    </Link>
                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>BIM </h1>
                    </Link>
                </div>

                <div>
                    <button className='text-amber-600 text-3xl' onClick={regresar}><IoArrowBackCircle /></button>


                </div>

            </div>


            <div className='grid grid-cols-2 gap-4 mt-4'>



                <div className=''>
                    <div className="bg-white rounded-lg mb-4">
                        <div className="bg-sky-600 text-white px-4 py-2 font-bold text-gray-500 rounded-t-lg">Elemento seleccionado</div>
                        <div className='text-sm px-4 py-3 flex flex-col gap-3'>
                            <p><strong className='text-gray-500'>Global id:</strong> <span className='font-normal bg-gray-400 rounded-lg px-4 py-1 text-white'>{selectedGlobalId || 'Sin seleccionar'}</span></p>


                            <p><strong className='text-gray-500'>Nombre del elemento:</strong> <span className='font-normal bg-gray-400 rounded-lg px-4 py-1 text-white'>{selectedNameBim || 'Sin seleccionar'}</span></p>

                        </div>
                    </div>


                    <div className="bg-white rounded-lg mb-4">
                        <div className="bg-sky-600 px-4 py-2 font-bold text-white rounded-t-lg">Lotes disponibles</div>
                        <div className="flex justify-between items-center px-4 py-3">
                            <div className="flex-grow pr-2">
                                <select onChange={handleSelectLote} value={selectedLote}
                                    className="block w-full mt-1 p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="">Seleccione un lote</option>
                                    {lotesFiltrados
                                        .sort((a, b) => a.parteNombre.localeCompare(b.parteNombre))  // Ordenando alfabéticamente por 'parteNombre'
                                        .map((lote) => (
                                            <option key={lote.docId} value={lote.docId}
                                                className={`${!lote.globalId ? 'bg-amber-300 text-gray-500' : 'bg-white text-black'}`}>
                                                {lote.nombre} - {lote.elementoNombre} - {lote.parteNombre}
                                            </option>
                                        ))
                                    }

                                </select>
                            </div>
                            <div>
                                <select onChange={handleFiltroChange} value={filtro}
                                    className="block w-full mt-1 p-2 bg-gray-100 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="todos">Todos</option>
                                    <option value="asignados">Asignados</option>
                                    <option value="noAsignados">No Asignados</option>
                                </select>
                            </div>
                        </div>
                    </div>



                    {/* Columna 2: Información y Acciones del Lote Seleccionado */}
                    <div className='bg-gray-200 rounded-lg shadow my-5'>

                        {selectedLote ? (
                            <>
                                <div className="bg-gray-100 rounded-lg">
                                    <div className="bg-sky-600 px-4 py-2 font-bold text-white rounded-t-lg">Información del Lote</div>
                                    <div className='text-sm px-4 py-2'>
                                        <div className="flex items-center justify-between">
                                            <p className={`font-medium ps-1 ${selectedLote?.globalId ? 'text-green-600' : 'text-amber-600'}`}>
                                                <strong>Global ID Bim:</strong> {selectedLote?.globalId || ''}
                                            </p>
                                            {selectedLote?.globalId ? (
                                                <button className="px-4 py-2 rounded-lg text-green-600 font-bold">ID Asignado</button>
                                            ) : (
                                                <div className='flex items-center gap-3 font-bold text-amber-600'>


                                                    <p>Sin asignar</p>
                                                    <button
                                                        onClick={() => selectedLote && selectedGlobalId && actualizarLoteConGlobalId(selectedLote.docId, selectedGlobalId, selectedNameBim)}
                                                        className={`px-4 py-2 rounded text-white ${selectedGlobalId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-500 cursor-not-allowed'}`}
                                                        disabled={!selectedLote || !selectedGlobalId}>
                                                        + Agregar
                                                    </button>
                                                </div>

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
                                <p className=" font-medium flex items-center gap-2 text-amber-600"> <strong className='text-3xl text-amber-500'>*</strong>Global id sin asignar</p>
                                <p className="text-gray-500 font-medium flex items-center gap-2 ps-5">Selecciona un lote para ver o asignar un Global ID.</p>
                            </div>
                        )}
                    </div>
                </div>


                <div>
                    <ViewerComponent setSelectedGlobalId={setSelectedGlobalId} setSelectedNameBim={setSelectedNameBim} />
                </div>


            </div>










            {modalExito && (
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
                                        <FaCheckCircle className='text-6xl text-teal-500' />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Éxito
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {mensajeExitoInspeccion}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setModalExito(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            {showSuccessModal && (
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
                                        <FaCheckCircle className='text-6xl text-green-500' />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Éxito
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {successMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setShowSuccessModal(false)}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}





        </div>
    );
}
