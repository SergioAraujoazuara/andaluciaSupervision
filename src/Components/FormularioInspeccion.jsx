import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaFilePdf } from "react-icons/fa";
import jsPDF from 'jspdf';
import logo from '../assets/tpf_logo_azul.png'
import { IoIosWarning } from "react-icons/io";
import imageCompression from 'browser-image-compression';
import { db } from '../../firebase_config';
import { getDoc, getDocs, doc, deleteDoc, collection, addDoc, runTransaction, writeBatch, setDoc, query, where, updateDoc } from 'firebase/firestore';

function FormularioInspeccion({ handleConfirmarEnvioPdf, setMensajeExitoInspeccion, setModalConfirmacionInforme, setModalFormulario, marcarFormularioComoEnviado, resultadoInspeccion, comentario, setComentario, firma, fechaHoraActual, handleCloseModal, ppiNombre, nombreResponsable, setResultadoInspeccion }) {

    const { id } = useParams()
    const { idLote } = useParams()
    const [nombreProyecto, setNombreProyecto] = useState(localStorage.getItem('nombre_proyecto') || '');
    const [numeroRegistro, setNumeroRegistro] = useState('');
    const [fecha, setFecha] = useState('');
    const [ppi, setPpi] = useState('');
    const [plano, setPlano] = useState('');
    // const [observaciones, setObservaciones] = useState('');
    const [sector, setSector] = useState('');
    const [subSector, setSubSector] = useState('');
    const [parte, setParte] = useState('');
    const [elemento, setElemento] = useState('');
    const [lote, setLote] = useState('');
    const [pkInicial, setPkInicial] = useState('');
    const [pkFinal, setPkFinal] = useState('');
    const titulo = "REGISTRO DE INSPECCIÓN DE OBRA REV-1"
    const [imagen, setImagen] = useState(null);
    const [imagen2, setImagen2] = useState(null);
    const imagenPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Adif_wordmark.svg/1200px-Adif_wordmark.svg.png"
    const imagenPath2 = logo
    const [obra, setObra] = useState(localStorage.getItem('obra'));
    const [tramo, setTramo] = useState(localStorage.getItem('tramo'));
    const [observaciones, setObservaciones] = useState('');


    useEffect(() => {
        const obtenerLotesPorPpiId = async () => {
            try {
                // Asegúrate de que `id` sea el ID de PPI por el cual quieres filtrar
                const q = query(collection(db, "lotes"), where("ppiId", "==", id));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const lotesData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));


                    setPpi(lotesData);
                } else {

                    setPpi(null);
                }
            } catch (error) {

                setPpi(null);
            }
        };

        if (id) {
            obtenerLotesPorPpiId();
        }
    }, [id]); // Asegúrate de que `id` sea una dependencia del efecto



    const [loteInfo, setLoteInfo] = useState(null); // Estado para almacenar los datos del PPI
    const [sectorInfoLote, setSectorInfoLote] = useState(null); // Estado para almacenar los datos del PPI
    const [idRegistro, setIdRegistro] = useState(''); // Estado para almacenar los datos del PPI


    useEffect(() => {
        const obtenerLotePorId = async () => {
            console.log('**********', idLote)
            if (!idLote) return; // Verifica si idLote está presente

            try {
                const docRef = doc(db, "lotes", idLote); // Crea una referencia al documento usando el id
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Datos del lote:", docSnap.data());
                    setLoteInfo({ id: docSnap.id, ...docSnap.data() });
                    console.log({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No se encontró el lote con el ID:", idLote);

                }
            } catch (error) {
                console.error("Error al obtener el lote:", error);

            }
        };

        obtenerLotePorId();
    }, [idLote]);



    const handleImagenChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: .3, // (opcional) Tamaño máximo en MB, por ejemplo, 0.5MB
                    maxWidthOrHeight: 600, // (opcional) ajusta la imagen al tamaño máximo (manteniendo la relación de aspecto)
                    useWebWorker: true, // (opcional) Usa un web worker para realizar la compresión en un hilo de fondo
                };
                const compressedFile = await imageCompression(file, options);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagen(reader.result); // Almacenar la imagen comprimida en el estado
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleImagenChange2 = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const options = {
                    maxSizeMB: .3, // Tamaño máximo en MB, ajustable según necesites
                    maxWidthOrHeight: 600, // Ajusta la imagen al tamaño máximo (manteniendo la relación de aspecto)
                    useWebWorker: true, // Utiliza un web worker para realizar la compresión en un hilo de fondo
                };
                const compressedFile = await imageCompression(file, options); // Comprimir la imagen
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagen2(reader.result); // Almacenar la imagen comprimida en base64 en el estado
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                console.error("Error al comprimir la imagen:", error);
            }
        }
    };




    const enviarDatosARegistros = async () => {
        // Objeto que representa los datos del formulario
        const datosFormulario = {
            nombreProyecto,
            fechaHoraActual: fechaHoraActual,
            obra: obra,
            tramo: tramo,
            ppiNombre: loteInfo.ppiNombre,
            observaciones: observaciones,
            comentario: comentario,
            sector: loteInfo.sectorNombre,
            subSector: loteInfo.subSectorNombre,
            parte: loteInfo.parteNombre,
            elemento: loteInfo.elementoNombre,
            lote: loteInfo.nombre,
            firma: firma,
            pkInicial: loteInfo.pkInicial,
            pkFinal: loteInfo.pkFinal,
            nombreResponsable: nombreResponsable,
            resultadoInspeccion: resultadoInspeccion,
            imagen: imagen, // imagen en base64
            imagen2: imagen2, // imagen2 en base64
        };

        try {
            // Referencia a la colección 'registros' en Firestore

            const coleccionRegistros = collection(db, "registros");
            const docRef = await addDoc(coleccionRegistros, datosFormulario);

            // Aquí es donde se obtiene el ID del documento recién creado
            const docId = docRef.id;




            // Ahora, actualizamos el documento para incluir su propio ID
            await updateDoc(doc(db, "registros", docId), {
                id: docId // Guarda el ID del documento dentro del mismo documento
            });
            // Ahora que tienes el ID y el documento está actualizado, genera el PDF
            generatePDF(firma, fechaHoraActual, nombreResponsable, docId);
            setIdRegistro(docId)
            // Opcionalmente, cierra el modal o limpia el formulario aquí
            setModalFormulario(false);
            setResultadoInspeccion('')
            setObservaciones('')
            setMensajeExitoInspeccion('Inspección completada con éxito')
            console.log("Documento escrito con ID: ", docRef.id);
            return docRef.id; // Devolver el ID del documento creado


        } catch (e) {
            console.error("Error al añadir documento: ", e);
        }
    };

    const handleConfirmarEnvio = async () => {
        // Aquí llamarías a la función que realmente envía los datos del formulario
        await handelEnviarFormulario();
        setMostrarConfirmacion(false); // Ocultar el modal de confirmación después de enviar los datos
    };

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);


    const handelEnviarFormulario = async () => {
        const idRegistroFormulario = await enviarDatosARegistros();
        if (idRegistroFormulario) {
            // La función enviarDatosARegistros ya se encarga de generar el PDF,
            // así que aquí puedes continuar con cualquier lógica posterior necesaria.

            await marcarFormularioComoEnviado(idRegistroFormulario, resultadoInspeccion);

            // Notifica que el proceso ha concluido satisfactoriamente, si es necesario.
            handleConfirmarEnvioPdf(); // Este paso puede ser opcional dependiendo de lo que haga esta función.
        }
    };



    const handleSolicitarConfirmacion = () => {
        setMostrarConfirmacion(true);
    };




    const generatePDF = (firma, fechaHoraActual, nombreResponsable, docId) => {
        const doc = new jsPDF();






        // Establecer el tamaño de fuente deseado
        const fontSize = 10;

        // Tamaño y posición del recuadro
        const rectX = 10;
        const rectY = 10;
        const rectWidth = 190; // Ancho del recuadro
        const rectHeight = 20; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        doc.setFillColor(230, 230, 230); // Gris muy claro casi blanco

        // Dibujar el recuadro con fondo gris
        doc.rect(rectX, rectY, rectWidth, rectHeight, 'F'); // 'F' indica que se debe rellenar el rectángulo

        // Establecer el color de texto
        doc.setTextColor(0, 0, 0); // Color negro

        // Colocar texto dentro del recuadro
        doc.text(titulo, 75, 18); // Ajusta las coordenadas según tu diseño
        doc.text(nombreProyecto, 75, 22); // Ajusta las coordenadas según tu diseño

        if (imagenPath2) {
            const imgData = imagenPath2;
            doc.addImage(imgData, 'JPEG', 12, 12, 30, 15); // Ajusta las coordenadas y dimensiones según tu diseño
        }
        if (imagenPath) {
            const imgData = imagenPath;
            doc.addImage(imgData, 'JPEG', 45, 15, 20, 10); // Ajusta las coordenadas y dimensiones según tu diseño
        }

        // Dibujar el borde después de agregar las imágenes
        doc.setDrawColor(0); // Color negro
        doc.rect(rectX, rectY, rectWidth, rectHeight); // Dibujar el borde del rectángulo


        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Tamaño y posición del segundo recuadro
        const rectX2 = 10;
        const rectY2 = 30;
        const rectWidth2 = 190; // Ancho del recuadro
        const rectHeight2 = 20; // Altura del recuadro

        // Establecer el ancho de la línea del borde
        const borderWidth = 0.5; // Ancho del borde en puntos

        // Establecer el color de la línea del borde
        doc.setDrawColor(0); // Color negro

        // Dibujar el borde del segundo recuadro
        doc.rect(rectX2, rectY2, rectWidth2, rectHeight2);

        // Establecer el color de fondo para el segundo recuadro
        doc.setFillColor(240, 240, 240); // Gris muy claro casi blanco

        // Dibujar el segundo recuadro con fondo gris claro y borde en todos los lados
        doc.rect(rectX2, rectY2, rectWidth2, rectHeight2, 'FD'); // 'FD' indica que se debe rellenar el rectángulo y dibujar el borde en todos los lados

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Colocar texto dentro del segundo recuadro
        doc.text(`Obra: ${obra}`, 15, 40);
        doc.text(`Tramo: ${tramo}`, 15, 45);
        doc.text(`Nº de registro: ${docId}`, 120, 40);
        doc.text(`Fecha: ${fechaHoraActual}`, 150, 45);


        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Tamaño y posición del recuadro
        const rectX3 = 10;
        const rectY3 = 50;
        const rectWidth3 = 190; // Ancho del recuadro
        const rectHeight3 = 20; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Establecer el color de fondo para el recuadro
        doc.setFillColor(240, 240, 240); // Gris muy claro casi blanco

        // Dibujar el recuadro con fondo gris claro
        doc.rect(rectX3, rectY3, rectWidth3, rectHeight3, 'FD'); // 'FD' indica que se debe rellenar el rectángulo y dibujar el borde

        // Establecer el color de texto
        doc.setTextColor(0, 0, 0); // Color negro

        // Colocar texto dentro del recuadro
        doc.text(`PPI: ${ppiNombre}`, 15, 60);
        doc.text(`Plano que aplica: `, 15, 65);


        // Tamaño y posición del recuadro
        const rectX4 = 10;
        const rectY4 = 70;
        const rectWidth4 = 190; // Ancho del recuadro
        const rectHeight4 = 20; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Establecer el color de fondo para el recuadro
        doc.setFillColor(240, 240, 240); // Gris claro casi blanco

        // Dibujar el recuadro con fondo gris claro
        doc.rect(rectX4, rectY4, rectWidth4, rectHeight4, 'FD'); // 'FD' indica que se debe rellenar el rectángulo y dibujar el borde

        // Establecer el color de texto
        doc.setTextColor(0, 0, 0); // Color negro

        // Dibujar el borde del rectángulo
        doc.rect(rectX4, rectY4, rectWidth4, rectHeight4);

        // Texto a colocar con salto de línea
        const textoObservaciones = `Observaciones: ${observaciones}`;

        // Dividir el texto en líneas cada vez que exceda 15 palabras
        const words = textoObservaciones.split(' ');
        const maxWordsPerLine = 15;
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < words.length; i++) {
            currentLine += words[i] + ' ';
            if ((i + 1) % maxWordsPerLine === 0 || i === words.length - 1) {
                lines.push(currentLine.trim());
                currentLine = '';
            }
        }

        // Colocar texto en el PDF
        let yPosition = rectY4 + fontSize + 2; // Iniciar la posición dentro del recuadro
        let xPosition = rectX4 + 5; // Ajustar posición x para evitar que el texto toque el borde del rectángulo
        lines.forEach(line => {
            doc.text(line, xPosition, yPosition, { maxWidth: rectWidth4 - 4 }); // Ajustar maxWidth para evitar que el texto exceda el ancho del rectángulo
            yPosition += fontSize + 2; // Aumentar la posición para la siguiente línea
        });

        // Tamaño y posición del recuadro 5
        const rectX5 = 10;
        const rectY5 = 90;
        const rectWidth5 = 190; // Ancho del recuadro
        const rectHeight5 = 80; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Establecer el color de fondo para el recuadro 5
        doc.setFillColor(240, 240, 240); // Gris claro casi blanco

        // Dibujar el recuadro 5 con fondo gris claro
        doc.rect(rectX5, rectY5, rectWidth5, rectHeight5, 'FD'); // 'FD' indica que se debe rellenar el rectángulo y dibujar el borde

        // Establecer el color de texto
        doc.setTextColor(0, 0, 0); // Color negro

        // Dibujar el borde del recuadro 5
        doc.rect(rectX5, rectY5, rectWidth5, rectHeight5);

        // Colocar texto dentro del recuadro 5
        doc.text(`Sector: ${loteInfo.sectorNombre}`, 15, 100);
        doc.text(`Subsector: ${loteInfo.subSectorNombre}`, 15, 110);
        doc.text(`Parte: ${loteInfo.parteNombre}`, 15, 120);
        doc.text(`Elemento: ${loteInfo.elementoNombre}`, 15, 130);
        doc.text(`Lote: ${loteInfo.nombre}`, 15, 140);
        doc.text(`Pk inicial: ${loteInfo.pkInicial}`, 15, 150);
        doc.text(`Pk final: ${loteInfo.pkFinal}`, 15, 160);

        // Tamaño y posición del recuadro 6
        const rectX6 = 10;
        const rectY6 = 170;
        const rectWidth6 = 190; // Ancho del recuadro
        const rectHeight6 = 70; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Establecer el color de fondo para el recuadro 6
        doc.setFillColor(240, 240, 240); // Gris claro casi blanco

        // Dibujar el recuadro 6 con fondo gris claro
        doc.rect(rectX6, rectY6, rectWidth6, rectHeight6, 'FD');

        // Dibujar el borde del recuadro 6
        doc.rect(rectX6, rectY6, rectWidth6, rectHeight6);

        // Agregar imagen al PDF dentro del recuadro 6
        if (imagen) {
            doc.addImage(imagen, 'JPEG', 25, 180, 70, 50); // Ajusta las coordenadas y el tamaño según necesites
        }
        if (imagen2) {
            doc.addImage(imagen2, 'JPEG', 110, 180, 70, 50); // Ajusta las coordenadas y el tamaño según necesites
        }

        // Tamaño y posición del recuadro 7
        const rectX7 = 10;
        const rectY7 = 240;
        const rectWidth7 = 190; // Ancho del recuadro
        const rectHeight7 = 28; // Altura del recuadro

        // Establecer el tamaño de fuente
        doc.setFontSize(fontSize);

        // Establecer el color de fondo para el recuadro 7
        doc.setFillColor(240, 240, 240); // Gris claro casi blanco

        // Dibujar el recuadro 7 con fondo gris claro
        doc.rect(rectX7, rectY7, rectWidth7, rectHeight7, 'FD');

        // Dibujar el borde del recuadro 7
        doc.rect(rectX7, rectY7, rectWidth7, rectHeight7);

        // Colocar texto dentro del recuadro 7
        doc.text('Resultado de la inspección', 150, 240);
        doc.text(resultadoInspeccion, 150, 240);
        doc.text(`Nombre del responsable ${nombreResponsable}`, 150, 250);

        doc.text(`Firmado electronicamente con blockchain`, 15, 250);
        doc.text(firma, 15, 260);
    
       







        doc.save('formulario.pdf');
    };





    return (
        <div className='text-gray-500'>
            {/* Navigation section
            <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
                <GoHomeFill style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/'}>
                    <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/elemento'}>
                    <h1 className='text-gray-500 text-gray-500'>Elementos</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'/tablaPpi'}>
                    <h1 className='text-gray-500 text-gray-500'>PPI</h1>
                </Link>
                <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
                <Link to={'#'}>
                    <h1 className='font-medium text-amber-600'>Formulario</h1>
                </Link>

            </div> */}


            <form className="bg-white text-gray-500  mb-4">
                <div className='grid sm:grid-cols-1 grid-cols-1 gap-4'>

                    {/* Campos de entrada */}
                    <div className="mb-4 hidden">
                        <label htmlFor="Proyecto" className="block text-gray-500 text-sm font-bold mb-2">Proyecto</label>
                        <input type="text" id="Proyecto" value={nombreProyecto} onChange={(e) => setNombreProyecto(e.target.value)}
                            className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4 hidden">
                        <label htmlFor="numeroRegistro" className="block text-gray-500 text-sm font-bold mb-2">Nº de registro</label>
                        <input type="text" id="numeroRegistro" value={numeroRegistro} onChange={(e) => setNumeroRegistro(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    {/* <div className="mb-4">
                        <label htmlFor="fecha" className="block text-gray-500 text-sm font-bold mb-2">Fecha</label>
                        <input type="date" id="fecha" value={fecha} onChange={(e) => setFecha(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div> */}
                    <div className="mb-4 hidden">
                        <label htmlFor="obra" className="block text-gray-500 text-sm font-bold mb-2">Obra</label>
                        <input type="text" id="obra" value={obra} onChange={(e) => setObra(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4 hidden">
                        <label htmlFor="tramo" className="block text-gray-500 text-sm font-bold mb-2">Tramo</label>
                        <input type="text" id="tramo" value={tramo} onChange={(e) => setTramo(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4 hidden">
                        <label htmlFor="ppi" className="block text-gray-500 text-sm font-bold mb-2">PPI</label>
                        <input type="text" id="ppi" value={localStorage.getItem('ppi' || '')} onChange={(e) => setPpi(e.target.value)}
                            className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4 hidden">
                        <label htmlFor="plano" className="block text-gray-500 text-sm font-bold mb-2">Plano que aplica</label>
                        <input type="text" id="plano" value={plano} onChange={(e) => setPlano(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="imagen" className="block text-gray-500 text-sm font-bold mb-2">Seleccionar imagen</label>
                        <input onChange={handleImagenChange} type="file" id="imagen" accept="image/*" className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="imagen" className="block text-gray-500 text-sm font-bold mb-2">Seleccionar imagen</label>
                        <input onChange={handleImagenChange2} type="file" id="imagen" accept="image/*" className="rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="observaciones" className="block text-gray-500 text-sm font-bold mb-2">Observaciones</label>
                        <textarea id="observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                    </div>
                </div>
                {/* Campos de trazabilidad */}
                <div className="mb-4 hidden">
                    <label className="block text-gray-700 text-sm font-bold mb-5">Trazabilidad</label>
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                        <div>
                            <label htmlFor="sector" className="block text-gray-700 text-sm font-bold mb-2">Sector</label>
                            <input
                                type="text" id="sector" value={loteInfo?.sectorNombre || ''} onChange={(e) => setSector(e.target.value)} className="bg-gray-200  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="subSector" className="block text-gray-700 text-sm font-bold mb-2">Sub sector</label>
                            <input type="text" id="subSector" value={loteInfo?.subSectorNombre || ''} onChange={(e) => setSubSector(e.target.value)} className="bg-gray-200  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="parte" className="block text-gray-700 text-sm font-bold mb-2">Parte</label>
                            <input type="text" id="parte" value={loteInfo?.parteNombre || ''} onChange={(e) => setParte(e.target.value)} className="bg-gray-200  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="elemento" className="block text-gray-700 text-sm font-bold mb-2">Elemento</label>
                            <input type="text" id="elemento" value={loteInfo?.elementoNombre || ''} onChange={(e) => setElemento(e.target.value)} className="bg-gray-200  shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="lote" className="block text-gray-700 text-sm font-bold mb-2">Lote</label>
                            <input type="text" id="lote" value={loteInfo?.nombre || ''} onChange={(e) => setLote(e.target.value)} className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="pkInicial" className="block text-gray-700 text-sm font-bold mb-2">Pk inicial</label>
                            <input type="text" id="pkInicial" value={loteInfo?.pkInicial || ''} onChange={(e) => setPkInicial(e.target.value)} className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label htmlFor="pkFinal" className="block text-gray-700 text-sm font-bold mb-2">Pk final</label>
                            <input type="text" id="pkFinal" value={loteInfo?.pkFinal || ''} onChange={(e) => setPkFinal(e.target.value)} className="bg-gray-200 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                    </div>
                </div>
                {/* Botones */}
                <div className='flex gap-5'>
                    <button type="button" onClick={handleSolicitarConfirmacion} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex gap-2 items-center"><FaFilePdf /> Guardar</button>
                    <button type="button" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex gap-2 items-center" onClick={() => setModalConfirmacionInforme(false)}>Cancelar </button>
                </div>
            </form>

            {
                mostrarConfirmacion && (
                    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-90 text-gray-500 fonmt-medium text-center">
                        <div className="bg-white p-5 rounded-lg shadow-lg">
                            <h2 className="font-bold text-lg mb-4">Estás seguro de que quieres guardar los datos?</h2>
                            <p className='flex items-center gap-2'><span className='font-bold text-amber-500 text-2xl'><IoIosWarning /></span>¿No podras modificarlos posteriormente y se creará el informe</p>
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    onClick={() => {
                                        handleConfirmarEnvio()
                                        setMostrarConfirmacion(false);
                                    }}
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => setMostrarConfirmacion(false)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }


        </div>
    )
}

export default FormularioInspeccion;
