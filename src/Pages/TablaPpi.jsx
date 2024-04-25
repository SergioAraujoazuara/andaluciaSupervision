import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase_config';
import { getDoc, getDocs, query, collection, where, doc, updateDoc, increment, addDoc, or } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import { IoMdAddCircle } from "react-icons/io";
import { SiReacthookform } from "react-icons/si";
import { FaFilePdf } from "react-icons/fa6";
import { FaQuestionCircle } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import FormularioInspeccion from '../Components/FormularioInspeccion'
import RecuperarPdf from './RecuperarPdf';
import jsPDF from 'jspdf';
import logo from '../assets/tpf_logo_azul.png'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function TablaPpi() {
    const titulo = "REGISTRO DE INSPECCIÓN DE OBRA REV-1"

    const imagenPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Adif_wordmark.svg/1200px-Adif_wordmark.svg.png"
    const imagenPath2 = logo
    const [nombreProyecto, setNombreProyecto] = useState(localStorage.getItem('nombre_proyecto') || '');
    const [obra, setObra] = useState(localStorage.getItem('obra'));
    const [tramo, setTramo] = useState(localStorage.getItem('tramo'));
    const [observaciones, setObservaciones] = useState('');
    const { idLote } = useParams();
    const navigate = useNavigate();
    const [ppi, setPpi] = useState(null);

 

    const handleObservaciones = (nuevasObservaciones) => {
        setObservaciones(nuevasObservaciones);
    };


    useEffect(() => {
        const obtenerInspecciones = async () => {
            try {
                const inspeccionesRef = collection(db, "lotes", idLote, "inspecciones");
                const querySnapshot = await getDocs(inspeccionesRef);

                const inspeccionesData = querySnapshot.docs.map(doc => ({
                    docId: doc.id, // Almacena el ID del documento generado automáticamente por Firestore
                    ...doc.data()
                }));

                // Asegúrate de que este paso esté ajustado a cómo manejas los datos en tu aplicación
                if (inspeccionesData.length > 0) {
                    setPpi(inspeccionesData[0]);
                    setPpiNombre(inspeccionesData[0].nombre) // O maneja múltiples inspecciones según sea necesario
                } else {
                    console.log('No se encontraron inspecciones para el lote con el ID:', idLote);
                    setPpi(null);
                }
            } catch (error) {
                console.error('Error al obtener las inspecciones:', error);
            }
        };



        obtenerInspecciones();
        console.log(ppi)
    }, [idLote]); // Dependencia del efecto basada en idLote

    useEffect(() => {

        console.log(ppi)
    }, []);




    const regresar = () => {
        navigate(-1); // Regresa a la página anterior
    };





    const [seleccionApto, setSeleccionApto] = useState({});
    const [tempSeleccion, setTempSeleccion] = useState(null);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalFormulario, setModalFormulario] = useState(false);
    const [currentSubactividadId, setCurrentSubactividadId] = useState(null);

    const [ppiNombre, setPpiNombre] = useState('');






    const handleOpenModal = (subactividadId) => {
        setCurrentSubactividadId(subactividadId);
        console.log(subactividadId)
        // Inicializar la selección temporal con el valor actual si existe
        const valorActual = seleccionApto[subactividadId]?.resultadoInspeccion;
        setTempSeleccion(valorActual);
        setModal(true);
    };


    const handleOpenModalFormulario = (subactividadId) => {
        setCurrentSubactividadId(subactividadId);
        console.log(subactividadId);
        // Inicializar la selección temporal con el valor actual si existe
        const valorActual = seleccionApto[subactividadId]?.resultadoInspeccion;
        setTempSeleccion(valorActual);
        // Añadir aquí el reseteo de los estados necesarios
        setComentario(''); // Resetear el comentario a un string vacío
        setObservaciones(''); // Si también necesitas resetear observaciones o cualquier otro estado, hazlo aquí
        setModalFormulario(true);
    };




    const handleCloseModal = () => {
        setModal(false)
        setModalFormulario(false)
        setComentario('')
        setResultadoInspeccion('Apto')


    };

    const handleGuardarTemporal = () => {
        // Solo muestra la confirmación, no aplica la selección todavía
        setMostrarConfirmacion(true);
    };

    const handleConfirmarGuardar = async () => {
        const fechaHoraActual = new Date().toLocaleString('es-ES', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });

        const hashFirma = 'GSJDJDN5663VDHSDN';

        if (currentSubactividadId && tempSeleccion !== null) {
            // Encuentra el índice de la actividad y de la subactividad desde el ID
            const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);

            // Prepara la evaluación de la subactividad seleccionada
            const evaluacionSubactividad = {

                enviado: true,
                fecha: fechaHoraActual,
                responsable: nombreResponsable,
                firma: hashFirma.toString(),
                comentario: comentario,
            };

            // Actualiza siempre la subactividad seleccionada con la nueva evaluación
            let subactividadActualizada = { ...ppi.actividades[actividadIndex].subactividades[subactividadIndex], ...evaluacionSubactividad };
            ppi.actividades[actividadIndex].subactividades[subactividadIndex] = subactividadActualizada;

            // Si la evaluación es "No apto", agrega una nueva subactividad para una futura inspección
            if (tempSeleccion === "No apto") {
                let nuevaSubactividad = { ...subactividadActualizada };
                const numeroPartes = subactividadActualizada.numero.split('.');
                if (numeroPartes.length === 2) {
                    nuevaSubactividad.numero += ".1";
                } else if (numeroPartes.length > 2) {
                    let repeticion = parseInt(numeroPartes.pop(), 10) + 1;
                    numeroPartes.push(repeticion.toString());
                    nuevaSubactividad.numero = numeroPartes.join('.');
                }

                // La nueva subactividad copiada no debe incluir los datos específicos de la evaluación
                delete nuevaSubactividad.resultadoInspeccion;
                delete nuevaSubactividad.enviado;
                delete nuevaSubactividad.fecha;
                delete nuevaSubactividad.responsable;
                delete nuevaSubactividad.firma;
                delete nuevaSubactividad.comentario;

                ppi.actividades[actividadIndex].subactividades.splice(subactividadIndex + 1, 0, nuevaSubactividad);
            }

            // Actualiza Firestore con el nuevo objeto ppi
            await actualizarPpiEnFirestore(ppi);

            // Limpia el formulario y cierra el modal
            setComentario('');
            setMostrarConfirmacion(false);
            setTempSeleccion(null);
            setModal(false);
        }
    };






    const actualizarPpiEnFirestore = async (nuevoPpi) => {
        if (!nuevoPpi.docId) {
            console.error("No se proporcionó docId para la actualización.");
            return;
        }

        try {
            // Aquí, "docId" es el ID del documento de Firestore donde se almacenan los datos del PPI.
            const ppiRef = doc(db, "lotes", idLote, "inspecciones", nuevoPpi.docId);

            // Prepara los datos que se van a actualizar. En este caso, actualizamos todo el objeto de actividades.
            const updatedData = {
                actividades: nuevoPpi.actividades.map(actividad => ({
                    ...actividad,
                    subactividades: actividad.subactividades.map(subactividad => ({
                        numero: subactividad.numero,
                        nombre: subactividad.nombre,
                        criterio_aceptacion: subactividad.criterio_aceptacion,
                        documentacion_referencia: subactividad.documentacion_referencia,
                        tipo_inspeccion: subactividad.tipo_inspeccion,
                        punto: subactividad.punto,
                        responsable: subactividad.responsable || '',
                        fecha: subactividad.fecha || '',
                        firma: subactividad.firma || '',
                        comentario: subactividad.comentario || '',
                        resultadoInspeccion: subactividad.resultadoInspeccion || '',
                        formularioEnviado: subactividad.formularioEnviado || '',
                        idRegistroFormulario: subactividad.idRegistroFormulario || ''
                        // Agrega aquí más campos si son necesarios.
                    }))
                }))
            };

            // Realiza la actualización en Firestore.
            await updateDoc(ppiRef, updatedData);

            console.log("PPI actualizado con éxito en Firestore.");
        } catch (error) {
            console.error("Error al actualizar PPI en Firestore:", error);
        }
    };


    // agregar cometarios
    const [comentario, setComentario] = useState("");

    const [resultadoInspeccion, setResultadoInspeccion] = useState("Apto");

    // Define la fecha, el responsable y genera la firma aquí
    const fechaHoraActual = new Date().toLocaleString('es-ES', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const nombreResponsable = "Usuario"; // Asumiendo que tienes una forma de obtener el nombre del usuario

    const firma = '9c8245e6e0b74cfccg97e8714u3234228fb4xcd2'

    const marcarFormularioComoEnviado = async (idRegistroFormulario, resultadoInspeccion,) => {
        if (!ppi || !currentSubactividadId) {
            console.error("PPI o subactividad no definida.");
            return;
        }

        // Divide el ID para obtener índices de actividad y subactividad
        const [actividadIndex, subactividadIndex] = currentSubactividadId.split('-').slice(1).map(Number);

        // Crea una copia del estado actual del PPI para modificarlo
        let nuevoPpi = { ...ppi };
        let subactividadSeleccionada = nuevoPpi.actividades[actividadIndex].subactividades[subactividadIndex];

        // Actualiza los campos con los datos necesarios
        subactividadSeleccionada.formularioEnviado = formulario;
        subactividadSeleccionada.idRegistroFormulario = idRegistroFormulario;
        subactividadSeleccionada.resultadoInspeccion = resultadoInspeccion;
        subactividadSeleccionada.fecha = fechaHoraActual;
        subactividadSeleccionada.responsable = nombreResponsable;
        subactividadSeleccionada.firma = firma;
        subactividadSeleccionada.comentario = comentario;

        // Si la inspección es "Apto", incrementa el contador de actividadesAptas en el lote
        if (resultadoInspeccion === "Apto") {
            const loteRef = doc(db, "lotes", idLote);
            await updateDoc(loteRef, {
                actividadesAptas: increment(1)
            });
        }

        // Si la inspección es No Apto, duplica la subactividad para una futura inspección
        if (resultadoInspeccion === "No apto") {
            let nuevaSubactividad = { ...subactividadSeleccionada };

            // Eliminar o reiniciar propiedades específicas de la evaluación para la nueva subactividad
            delete nuevaSubactividad.resultadoInspeccion;
            delete nuevaSubactividad.enviado;
            delete nuevaSubactividad.idRegistroFormulario;

            // Restablecer los valores de Responsable, Fecha, Comentarios e Inspección
            // Aquí asumimos que quieres restablecerlos a valores vacíos o predeterminados
            nuevaSubactividad.responsable = '';
            nuevaSubactividad.fecha = '';
            nuevaSubactividad.comentario = '';
            // Para el campo Inspección, asegúrate de restablecerlo según cómo lo manejas en tu modelo de datos
            // Si Inspección se maneja con otro campo o de otra forma, ajusta esta línea acorde a tu implementación
            // Por ejemplo, si 'inspeccion' es un campo booleano que indica si se ha realizado una inspección
            nuevaSubactividad.formularioEnviado = false; // Ajusta el nombre del campo y el valor según tu caso


            // Incrementa el número de versión de la nueva subactividad
            if (nuevaSubactividad.version) {
                nuevaSubactividad.version = String(parseInt(nuevaSubactividad.version) + 1);
            } else {
                // Si por alguna razón la subactividad original no tiene número de versión, se inicializa a 1
                nuevaSubactividad.version = "1";
            }

            // Inserta la nueva subactividad en el PPI
            nuevoPpi.actividades[actividadIndex].subactividades.splice(subactividadIndex + 1, 0, nuevaSubactividad);
        }


        // Actualiza la subactividad en el array
        nuevoPpi.actividades[actividadIndex].subactividades[subactividadIndex] = subactividadSeleccionada;

        // Llama a la función que actualiza los datos en Firestore
        await actualizarFormularioEnFirestore(nuevoPpi);
    };






    const actualizarFormularioEnFirestore = async (nuevoPpi) => {
        if (!nuevoPpi.docId) {
            console.error("No se proporcionó docId para la actualización.");
            return;
        }

        try {
            // Aquí, "docId" es el ID del documento de Firestore donde se almacenan los datos del PPI.
            const ppiRef = doc(db, "lotes", idLote, "inspecciones", nuevoPpi.docId);

            // Prepara los datos que se van a actualizar. En este caso, actualizamos todo el objeto de PPI.
            const updatedData = {
                actividades: nuevoPpi.actividades.map(actividad => ({
                    ...actividad,
                    subactividades: actividad.subactividades.map(subactividad => ({
                        ...subactividad,

                    }))
                }))
            };

            // Realiza la actualización en Firestore.
            await updateDoc(ppiRef, updatedData);

            console.log("PPI actualizado con éxito en Firestore.");
        } catch (error) {
            console.error("Error al actualizar PPI en Firestore:", error);
        }
    };



    const [modalInforme, setModalInforme] = useState(false)
    const [modalConfirmacionInforme, setModalConfirmacionInforme] = useState(false)

    const confirmarInforme = () => {
        setModalInforme(true)
        handleCloseModal()
    }

    const closeModalConfirmacion = () => {
        setModalInforme(false)

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
            console.log('**********', idLote)
            if (!idLote) return; // Verifica si idLote está presente

            try {
                const docRef = doc(db, "lotes", idLote); // Crea una referencia al documento usando el id
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    console.log("Datos del lote:", docSnap.data());
                    setLoteInfo({ id: docSnap.id, ...docSnap.data() });
                    console.log({ id: docSnap.id, ...docSnap.data() }, 'lote info****loteinfo');
                } else {
                    console.log("No se encontró el lote con el ID:", idLote);

                }
            } catch (error) {
                console.error("Error al obtener el lote:", error);

            }
        };

        obtenerLotePorId();
    }, [idLote]);

    const [formulario, setFormulario] = useState(true)

    // const crearVariableFormularioTrue = () => {
    //     setFormulario(true)
    // }

   
    const enviarDatosARegistros = async () => {
        // Descomponer currentSubactividadId para obtener los índices
        const [, actividadIndex, subactividadIndex] = currentSubactividadId.split('-').map(Number);

        // Acceder a la subactividad seleccionada
        const actividadSeleccionada = ppi.actividades[actividadIndex];
        const subactividadSeleccionada = ppi.actividades[actividadIndex].subactividades[subactividadIndex];

        // Objeto que representa los datos del formulario
        const datosFormulario = {
            nombreProyecto,
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
            actividad: actividadSeleccionada.actividad,
            num_actividad: actividadSeleccionada.numero,
            version_subactividad: subactividadSeleccionada.version,
            numero_subactividad: subactividadSeleccionada.numero,
            subactividad: subactividadSeleccionada.nombre, // Nombre de la subactividad seleccionada
            criterio_aceptacion: subactividadSeleccionada.criterio_aceptacion,
            documentacion_referencia: subactividadSeleccionada.documentacion_referencia,
            tipo_inspeccion: subactividadSeleccionada.tipo_inspeccion,
            punto: subactividadSeleccionada.punto,
            nombre_responsable: nombreResponsable,
            fechaHoraActual: fechaHoraActual,
            globalId: loteInfo.globalId,
            nombreGlobalId: loteInfo.nameBim,
            resultadoInspeccion: resultadoInspeccion,
            formulario: formulario
        };

        try {
            // Referencia a la colección 'registros' en Firestore

            const coleccionRegistros = collection(db, "registros");
            const docRef = await addDoc(coleccionRegistros, datosFormulario);
            setMensajeExitoInspeccion('Inspección completada con éxito')

            // Opcionalmente, cierra el modal o limpia el formulario aquí
            setModalFormulario(false);

            setObservaciones('')
            setComentario('')
            console.log("Documento escrito con ID: ", docRef.id);
            return docRef.id; // Devolver el ID del documento creado


        } catch (e) {
            console.error("Error al añadir documento: ", e);
        }
    };

    const handleConfirmarEnviotablaPpi = async () => {
        // Aquí llamarías a la función que realmente envía los datos del formulario
        await handelEnviarFormulario();
        setMostrarConfirmacion(false);
        setModalInforme(false);

        setComentario('')
        // Esperar un poco antes de mostrar el modal de éxito para asegurar que los modales anteriores se han cerrado
        setTimeout(() => {
            setModalExito(true);


        }, 300); // Ajusta el tiempo según sea necesario
    };

    const handleConfirmarEnvioPdf = async () => {
        // Aquí llamarías a la función que realmente envía los datos del formulario
        setMostrarConfirmacion(false);
        setModalFormulario(false);
        setModalConfirmacionInforme(false)




        // Esperar un poco antes de mostrar el modal de éxito para asegurar que los modales anteriores se han cerrado
        setTimeout(() => {
            setModalExito(true);

        }, 300); // Ajusta el tiempo según sea necesario
    };






    const handelEnviarFormulario = async () => {
        const idRegistroFormulario = await enviarDatosARegistros();
        if (idRegistroFormulario) {
            await marcarFormularioComoEnviado(idRegistroFormulario, resultadoInspeccion);

        }
    };

    const [mensajeExitoInspeccion, setMensajeExitoInspeccion] = useState('')
    const [modalExito, setModalExito] = useState(false)

    const [documentoFormulario, setDocumentoFormulario] = useState(null)
    const [modalRecuperarFormulario, setModalRecuperarFormulario] = useState(false)

    const handleMostrarIdRegistro = async (subactividadId) => {
        const [actividadIndex, subactividadIndex] = subactividadId.split('-').slice(1).map(Number);
        const subactividadSeleccionada = ppi.actividades[actividadIndex].subactividades[subactividadIndex];
        const idRegistroFormulario = subactividadSeleccionada.idRegistroFormulario;

        // Asegúrate de que existe un id antes de intentar recuperar el documento
        if (idRegistroFormulario) {
            try {
                // Obtener la referencia del documento en la colección de registros
                const docRef = doc(db, "registros", idRegistroFormulario);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDocumentoFormulario(docSnap.data())
                    setModalRecuperarFormulario(true)
                    console.log("Datos del documento:", docSnap.data());
                } else {
                    console.log("No se encontró el documento con el ID:", idRegistroFormulario);
                }
            } catch (error) {
                console.error("Error al obtener el documento:", error);
            }
        } else {
            console.log("No se proporcionó un idRegistroFormulario válido.");
        }
    };

    const cerrarModalYLimpiarDatos = () => {
        setDocumentoFormulario('')
        setModalRecuperarFormulario(false)
    }





    const generatePDF = async () => {
        // Crear un nuevo documento PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // Tamaño de la página para A4 en puntos


        const imageOk = 'https://cdn-icons-png.freepik.com/256/7778/7778643.png?semt=ais_hybrid'
        const imageNotOk = 'https://cdn-icons-png.flaticon.com/512/1304/1304038.png'

        // Añadir contenido al PDF
        const { width, height } = page.getSize();
        // Cargar las fuentes regular y en negrita
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const addText = (text, x, y, fontSize, font, color = rgb(0, 0, 0)) => { // Color negro por defecto
            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font: font,
                color: color,
            });
        };



        // Función para agregar una línea horizontal
        const addHorizontalLine = (x1, y, x2, lineWidth) => {
            page.drawLine({
                start: { x: x1, y },
                end: { x: x2, y },
                thickness: lineWidth,
                color: rgb(0, 0, 0), // Color negro
            });
        };

        // Función para agregar imágenes al PDF
        const embedImage = async (imagePath, x, y, width, height) => {
            const imageBytes = await fetch(imagePath).then(res => res.arrayBuffer());
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, {
                x,
                y,
                width,
                height,
            });
        };

        // Definir coordenadas y tamaños de los rectángulos
        const rectangles = [
            { x: 10, y: 10, width: 190, height: 20, color: [230, 230, 230], borderWidth: 0.5 },
            // Define tus otros rectángulos aquí...
        ];

        // Agregar texto al PDF
        addText(titulo, 40, height - 35, 12, boldFont);
        addText(nombreProyecto, 40, height - 50, 12, boldFont);

        const greenColor = rgb(0, 0.5, 0);  // Verde oscuro
        const redColor = rgb(1, 0, 0);      // Rojo

        // Condición para elegir el color del texto basado en el resultado de la inspección
        const textColor = documentoFormulario.resultadoInspeccion === 'Apto' ? greenColor : redColor;

        // Añadir texto con el color condicional
        addText(documentoFormulario.resultadoInspeccion || '', 500, height - 90, 12, boldFont, textColor);

        // Condicional para mostrar la imagen correspondiente basado en el resultado
        // Primero, verifica si el resultado de la inspección es 'Apto'
        if (documentoFormulario.resultadoInspeccion === 'Apto') {
            // Mostrar la imagen "Ok" si el resultado es "Apto"
            await embedImage(imageOk, 475, height - 95, 20, 20);
        } else if (documentoFormulario.resultadoInspeccion === 'No apto') {
            // Mostrar la imagen "Not Ok" si el resultado es "No apto"
            await embedImage(imageNotOk, 475, height - 95, 20, 20);
        } else {
            // No hacer nada si el resultado es undefined, null, o cualquier otro valor no manejado
            // No se muestra ninguna imagen.
        }
        // Agregar imágenes al lado del nombre del proyecto
        await embedImage(imagenPath2, 380, height - 58, 80, 45); // Ajusta las coordenadas y dimensiones según sea necesario
        await embedImage(imagenPath, 490, height - 55, 70, 35); // Ajusta las coordenadas y dimensiones según sea necesario

        // Agregar una línea horizontal debajo del nombre del proyecto
        addHorizontalLine(40, height - 65, 555, 1); // Ajusta las coordenadas y el grosor según sea necesario


        //* Datos *******************************************************************************************************************

        addText(documentoFormulario.obra, 40, height - 80, 10);
        addText(documentoFormulario.tramo, 40, height - 95, 10);




        // Función para agregar una línea horizontal con un color específico
        const addColoredHorizontalLine = (x1, y, x2, lineWidth, color) => {
            page.drawLine({
                start: { x: x1, y },
                end: { x: x2, y },
                thickness: lineWidth,
                color: rgb(color[0], color[1], color[2]), // Convertir los valores de color al rango correcto
            });
        };

        // Función para convertir un color hexadecimal a RGB
        const hexToRgb = (hex) => {
            // Eliminar el '#' del inicio si está presente
            hex = hex.replace(/^#/, '');

            // Convertir el color hexadecimal a RGB
            const bigint = parseInt(hex, 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;

            return [r / 255, g / 255, b / 255];
        };

        // Función para agregar texto en múltiples líneas
        const addTextInLines = (text, x, start_y, fontSize, lineGap, maxWordsPerLine = 12) => {
            const words = text.split(' ');
            let currentLine = '';
            let y = start_y;

            words.forEach((word, index) => {
                currentLine += word + ' ';
                if ((index + 1) % maxWordsPerLine === 0 || index === words.length - 1) {
                    addText(currentLine, x, y, fontSize);
                    y -= lineGap; // Moverse hacia abajo para la siguiente línea
                    currentLine = ''; // Resetear la línea actual
                }
            });
            return y; // Retornar la posición y final
        };

        // Llamada a la función para convertir el color hexadecimal a RGB
        const color = hexToRgb('#e5e7eb');
        // Llamada a la función para agregar la línea horizontal con el color especificado
        addColoredHorizontalLine(40, height - 118, 555, 20, color); // Azul

        //! Columna trazabilidad

        addText('Trazabilidad', 50, height - 122, 10, boldFont);

            //* Columna 1
            addText(`Pk inicial: `, 50, height - 145, 10, boldFont);
            addText(loteInfo.pkInicial, 100, height - 145, 10, regularFont);
            addText(`Pk final: `, 50, height - 160, 10, boldFont);
            addText(loteInfo.pkFinal, 90, height - 160, 10, regularFont);
            addText(`Sector: `, 50, height - 175, 10, boldFont);
            addText(documentoFormulario.sector, 88, height - 175, 10, regularFont);
            addText(`Sub Sector: `, 50, height - 190, 10, boldFont);
            addText(documentoFormulario.subSector, 110, height - 190, 10, regularFont);
            addText(`Parte:`, 50, height - 205, 10, boldFont);
            addText(documentoFormulario.parte, 80, height - 205, 10, regularFont);
    
            //* Columna 2     
            addText(`Elemento:`, 320, height - 145, 10, boldFont);
            addText(documentoFormulario.elemento, 370, height - 145, 10, regularFont);
            addText(`Lote:`, 320, height - 160, 10, boldFont);
            addText(documentoFormulario.lote, 350, height - 160, 10, regularFont);
            addText(`Nombre modelo: `, 320, height - 175, 10, boldFont);
            addText(documentoFormulario.nombreGlobalId, 405, height - 175, 10, regularFont);
            addText(`GlobalId modelo: `, 320, height - 190, 10, boldFont);
            addText(documentoFormulario.globalId, 410, height - 190, 10, regularFont);

        //! Columna PPI
        // Llamada a la función para agregar la línea horizontal con el color especificado
        addColoredHorizontalLine(40, height - 230, 555, 20, color); // Azul
        addText('PPI', 50, height - 235, 10, boldFont);

        addText(`Nombre PPI:`, 50, height - 260, 10, boldFont);
        addText(documentoFormulario.ppiNombre, 115, height - 260, 10, regularFont);
        addText(`Actividad: `, 50, height - 275, 10, boldFont);
        addText(`${documentoFormulario.num_actividad}. ${documentoFormulario.actividad}`, 105, height - 275, 10, regularFont);
        // Añadir 'Sub actividad'
        addText(`Sub actividad: `, 50, height - 290, 10, boldFont);
        let newY = addTextInLines(
            `(V-${documentoFormulario.version_subactividad}) ${documentoFormulario.numero_subactividad}. ${documentoFormulario.subactividad}`,
            50, // x inicial
            height - 305, // y inicial
            10, // tamaño de fuente
            15, // espacio entre líneas
            13, // máximas palabras por línea
            regularFont // fuente
        );

        // Asegúrate de dejar un espacio después de 'Sub actividad' si es necesario
        newY -= 2; // Ajusta este valor según sea necesario para el espacio deseado

        // Añadir 'Criterio de aceptación' usando la nueva posición 'y' debajo de 'Sub actividad'
        addText(`Criterio de aceptación: `, 50, newY, 10, boldFont);
        let newY2 = addTextInLines(
            `${documentoFormulario.criterio_aceptacion}`,
            50, // x inicial
            newY - 15, // comienza un poco más abajo de donde terminó 'Sub actividad'
            10, // tamaño de fuente
            15, // espacio entre líneas
            13, // máximas palabras por línea
            regularFont // fuente
        );

        // Añadir 'Doc. ref' dividido en título y contenido
        newY2 -= 2; // Espacio entre 'Criterio de aceptación' y 'Doc. ref'
        addText(`Doc. ref:`, 50, newY2, 10, boldFont); // Título en negritas
        addText(documentoFormulario.documentacion_referencia, 95, newY2, 10, regularFont); // Contenido en fuente normal

        // Añadir 'Tipo inspección' dividido en título y contenido
        newY2 -= 15; // Espacio entre 'Doc. ref' y 'Tipo inspección'
        addText(`Tipo inspección:`, 50, newY2, 10, boldFont); // Título en negritas
        addText(documentoFormulario.tipo_inspeccion, 132, newY2, 10, regularFont); // Contenido en fuente normal


        //! Columna Resultado inspeccion
        // Llamada a la función para agregar la línea horizontal con el color especificado
        addColoredHorizontalLine(40, height - 430, 525, 20, color); // Azul
        addText('Inspección', 50, height - 433, 10, boldFont);

        // Añade texto en verde
        addText(`Resultado: `, 50, height - 460, 10, boldFont);
       
        // Añadir texto con el color condicional
        addText(documentoFormulario.resultadoInspeccion || '', 125, height - 460, 10, boldFont, textColor);

        // Condicional para mostrar la imagen correspondiente basado en el resultado
        // Primero, verifica si el resultado de la inspección es 'Apto'
        if (documentoFormulario.resultadoInspeccion === 'Apto') {
            // Mostrar la imagen "Ok" si el resultado es "Apto"
            await embedImage(imageOk, 105, height - 463, 15, 15);
        } else if (documentoFormulario.resultadoInspeccion === 'No apto') {
            // Mostrar la imagen "Not Ok" si el resultado es "No apto"
            await embedImage(imageNotOk, 105, height - 463, 15, 15);
        } else {
            // No hacer nada si el resultado es undefined, null, o cualquier otro valor no manejado
            // No se muestra ninguna imagen.
        }


        addText('Fecha y hora inicial: ', 50, height - 475, 10, boldFont);
        addText(documentoFormulario.fechaHoraActual || '', 150, height - 475, 10);
        addText('Fecha y hora final: ', 50, height - 490, 10, boldFont);
        addText(documentoFormulario.fechaHoraActual || '', 150, height - 490, 10);
        addText('Número de inspecciones realizadas: ', 50, height - 505, 10, boldFont);
        addText('1' || '', 225, height - 505, 10);

        // Llamada a la función para agregar la línea horizontal con el color especificado
        addColoredHorizontalLine(40, height - 530, 555, 20, color); // Azul
        addText('Observaciones', 50, height - 533, 10, boldFont);
        addText(documentoFormulario.observaciones , 90, height - 560, 10);


        // Guardar el PDF en un archivo
        const pdfBytes = await pdfDoc.save();

        // Convierte los bytes del PDF en un Blob
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

        // Descarga el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'formulario.pdf';
        link.click();
        URL.revokeObjectURL(pdfUrl);

        cerrarModalYLimpiarDatos();
    };




    return (
        <div className='min-h-screen px-14 py-5 text-gray-500 text-sm'>

            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>

                <div className='flex items-center gap-2'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'/'}>
                        <h1 className=' text-gray-500'>Inicio</h1>
                    </Link>

                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />

                    <h1 className='cursor-pointer text-gray-500' onClick={regresar}>Elementos</h1>

                    <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Ppi: {ppiNombre}</h1>
                    </Link>
                </div>

            </div>




            <div className='flex gap-3 flex-col mt-5 bg-white p-8 rounded-xl shadow-md'>
                <div className="w-full rounded-xl overflow-x-auto">
                    <div>
                        <div className="w-full bg-gray-300 text-gray-600 text-sm font-medium py-3 px-3 grid grid-cols-24">
                            <div className='col-span-1'>Versión</div>
                            <div className='col-span-1'>Nº</div>

                            <div className="col-span-3">Actividad</div>
                            <div className="col-span-4">Criterio de aceptación</div>
                            <div className="col-span-2 text-center">Documentación de referencia</div>
                            <div className="col-span-2 text-center">Tipo de inspección</div>
                            <div className="col-span-1 text-center">Punto</div>
                            <div className="col-span-2 text-center">Responsable</div>
                            <div className="col-span-2 text-center">Fecha</div>
                            <div className="col-span-3 text-center">Comentarios</div>
                            {/* <div className="col-span-2 text-center">Estatus</div> */}
                            {/* <div className="col-span-1 text-center">Inspección</div> */}
                            <div className="col-span-2 text-center">Estado</div>
                            <div className="col-span-1 text-center">Informe</div>

                        </div>


                        <div>
                            {ppi && ppi.actividades.map((actividad, indexActividad) => [
                                // Row for activity name
                                <div key={`actividad-${indexActividad}`} className="bg-gray-200 grid grid-cols-24 items-center px-3 py-3 border-b border-gray-200 text-sm font-medium">
                                    <div className="col-span-1">

                                        (V)

                                    </div>
                                    <div className="col-span-1">

                                        {actividad.numero}

                                    </div>
                                    <div className="col-span-22">

                                        {actividad.actividad}

                                    </div>

                                </div>,
                                // Rows for subactividades
                                ...actividad.subactividades.map((subactividad, indexSubactividad) => (
                                    <div key={`subactividad-${indexActividad}-${indexSubactividad}`} className="grid grid-cols-24 items-center border-b border-gray-200 text-sm">
                                        <div className="col-span-1 px-3 py-5 ">
                                            V-{subactividad.version}  {/* Combina el número de actividad y el índice de subactividad */}
                                        </div>
                                        <div className="col-span-1 px-3 py-5 ">
                                            {subactividad.numero} {/* Combina el número de actividad y el índice de subactividad */}
                                        </div>

                                        <div className="col-span-3 px-3 py-5">
                                            {subactividad.nombre}
                                        </div>

                                        <div className="col-span-4 px-3 py-5">
                                            {subactividad.criterio_aceptacion}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.documentacion_referencia}
                                        </div>
                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.tipo_inspeccion}
                                        </div>
                                        <div className="col-span-1 px-3 py-5 text-center">
                                            {subactividad.punto}
                                        </div>




                                        <div className="col-span-2 px-3 py-5 text-center">
                                            {subactividad.responsable || ''}
                                        </div>
                                        <div className="col-span-2 px-5 py-5 text-center">
                                            {/* Aquí asumo que quieres mostrar la fecha en esta columna, ajusta según sea necesario */}
                                            {subactividad.fecha || ''}
                                        </div>
                                        <div className="col-span-3 px-5 py-5 text-center">
                                            {subactividad.comentario || ''}
                                        </div>



                                        <div className="col-span-2 px-5 py-5 bg-white flex justify-center cursor-pointer" >
                                            {subactividad.resultadoInspeccion ? (
                                                subactividad.resultadoInspeccion === "Apto" ? (
                                                    <span

                                                        className="w-full font-bold text-lg p-2 rounded  text-center text-green-500 cursor-pointer">
                                                        Apto

                                                    </span>
                                                ) : subactividad.resultadoInspeccion === "No apto" ? (
                                                    <span

                                                        className="w-full font-bold text-lg p-2 rounded w-full text-center text-red-600 cursor-pointer">
                                                        No apto
                                                    </span>
                                                ) : (
                                                    <span
                                                        onClick={() => handleOpenModalFormulario(`apto-${indexActividad}-${indexSubactividad}`)}
                                                        className="w-full font-bold text-medium text-3xl p-2 rounded  w-full flex justify-center cursor-pointer">
                                                        <IoMdAddCircle />
                                                    </span>
                                                )
                                            ) : (
                                                <span
                                                    onClick={() => handleOpenModalFormulario(`apto-${indexActividad}-${indexSubactividad}`)}
                                                    className="w-full font-bold text-medium text-3xl p-2 rounded  w-full flex justify-center cursor-pointer">
                                                    <IoMdAddCircle />
                                                </span>
                                            )}
                                        </div>

                                        <div className="col-span-1 px-2 py-5 bg-white flex justify-start cursor-pointer" >
                                            {subactividad.formularioEnviado ? (

                                                <p
                                                    onClick={() => handleMostrarIdRegistro(`apto-${indexActividad}-${indexSubactividad}`)}
                                                    className='text-2xl'><FaFilePdf /></p>
                                            ) : null}
                                        </div>






                                    </div>
                                ))
                            ])}
                        </div>
                    </div>
                </div>
            </div>


            {modalFormulario && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-90"></div>

                    <div className="mx-auto w-[720px] h-[780px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300">
                            <IoCloseCircle />
                        </button>

                        <div className="my-6">
                            <label htmlFor="resultadoInspeccion" className="block text-2xl font-bold text-gray-500 mb-4 flex items-center gap-2">
                                <span className='text-3xl'><SiReacthookform /></span> Resultado de la inspección:
                            </label>
                            <div className="block w-full py-2 text-base p-2 border-gray-300 focus:outline-none focus:ring-gray-500  sm:text-sm rounded-md">
                                {/* Opción Apto */}
                                <div>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="resultadoInspeccion"
                                            value="Apto"
                                            checked={resultadoInspeccion === "Apto"}
                                            onChange={(e) => setResultadoInspeccion(e.target.value)}
                                            className="form-radio"
                                        />
                                        <span className="ml-2">Apto</span>
                                    </label>
                                </div>
                                {/* Opción No apto */}
                                <div>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="resultadoInspeccion"
                                            value="No apto"
                                            checked={resultadoInspeccion === "No apto"}
                                            onChange={(e) => setResultadoInspeccion(e.target.value)}
                                            className="form-radio"
                                        />
                                        <span className="ml-2">No apto</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comentario" className="block text-gray-500 text-sm font-bold mb-2">Comentarios de la inspección</label>
                            <textarea id="comentario" value={comentario} onChange={(e) => setComentario(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                        </div>

                        {/* <div className='my-8'>
                            <label htmlFor="formularioCheckbox" className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="formularioCheckbox"
                                    checked={formulario}
                                    onChange={e => setFormulario(e.target.checked)} // Actualizado para usar setFormulario directamente
                                    className="form-checkbox rounded text-sky-600"
                                />
                                <span className='flex gap-2 items-center font-medium'><p className='text-xl ms-2'><FaFilePdf/></p> Crear Informe pdf </span>
                            </label>
                        </div> */}

                        <FormularioInspeccion
                            setModalFormulario={setModalFormulario}
                            modalFormulario={modalFormulario}
                            currentSubactividadId={currentSubactividadId}
                            ppiSelected={ppi}
                            marcarFormularioComoEnviado={marcarFormularioComoEnviado}
                            actualizarFormularioEnFirestore={actualizarFormularioEnFirestore}
                            resultadoInspeccion={resultadoInspeccion}
                            comentario={comentario}
                            firma={firma}

                            fechaHoraActual={fechaHoraActual}
                            handleCloseModal={handleCloseModal}
                            ppiNombre={ppiNombre}
                            nombreResponsable={nombreResponsable}

                            setResultadoInspeccion={setResultadoInspeccion}
                            enviarDatosARegistros={enviarDatosARegistros}

                            setModalConfirmacionInforme={setModalConfirmacionInforme}

                            handleConfirmarEnvioPdf={handleConfirmarEnvioPdf}
                            setMensajeExitoInspeccion={setMensajeExitoInspeccion}
                            handleConfirmarEnviotablaPpi={handleConfirmarEnviotablaPpi}
                            onObservaciones={handleObservaciones}


                        />







                        {/* <div className='flex gap-5 mt-8'>
                            <button className='bg-sky-600 hover:bg-sky-700 px-4 py-2 text-white font-medium rounded-lg shadow-md' onClick={confirmarInforme}>Guardar</button>
                            <button className='bg-gray-500 hover:bg-gray-600 px-4 py-2 text-white font-medium rounded-lg shadow-md' onClick={handleCloseModal}>Cancelar</button>
                        </div> */}





                    </div>

                </div>
            )}

            {modalInforme && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-90"></div>

                    <div className="mx-auto w-[700px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8"
                    >
                        <button
                            onClick={closeModalConfirmacion}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300 mb-5">
                            <IoCloseCircle />
                        </button>

                        <p className='text-xl font-medium flex gap-2 mb-10 items-center'><p className='text-2xl'><FaQuestionCircle /></p> ¿Quieres generar un informe en Pdf?</p>


                        <div className='flex items-center gap-5 mt-5'>
                            <button className='bg-sky-600 hover:bg-sky-700 px-4 py-3 rounded-md shadow-md text-white font-medium flex gap-2 items-center'
                                onClick={() => {
                                    confirmarModalInforme()
                                    crearVariableFormularioTrue()
                                }}><p className='text-xl'><FaFilePdf /></p>Si, generar informe</button>
                            <button
                                onClick={handleConfirmarEnviotablaPpi}
                                className="bg-gray-500 hover:bg-gray-600 text-white rounded-md shadow-md font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                No, realizar únicamente la inspección
                            </button>

                        </div>





                    </div>

                </div>
            )}

            {modalConfirmacionInforme && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-90"></div>

                    <div className="mx-auto w-[700px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8"
                    >
                        <button
                            onClick={() => setModalConfirmacionInforme(false)}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300">
                            <IoCloseCircle />
                        </button>

                        <FormularioInspeccion
                            setModalFormulario={setModalFormulario}
                            modalFormulario={modalFormulario}
                            currentSubactividadId={currentSubactividadId}
                            ppiSelected={ppi}
                            marcarFormularioComoEnviado={marcarFormularioComoEnviado}
                            actualizarFormularioEnFirestore={actualizarFormularioEnFirestore}
                            resultadoInspeccion={resultadoInspeccion}
                            comentario={comentario}
                            firma={firma}

                            fechaHoraActual={fechaHoraActual}
                            handleCloseModal={handleCloseModal}
                            ppiNombre={ppiNombre}
                            nombreResponsable={nombreResponsable}

                            setResultadoInspeccion={setResultadoInspeccion}


                            setModalConfirmacionInforme={setModalConfirmacionInforme}

                            handleConfirmarEnvioPdf={handleConfirmarEnvioPdf}
                            setMensajeExitoInspeccion={setMensajeExitoInspeccion}
                            formulario={formulario}
                            setComentario={setComentario}

                        />





                    </div>

                </div>
            )}

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

            {modalRecuperarFormulario && (
                <div className="fixed inset-0 z-50 overflow-auto flex justify-center items-center p-10">
                    <div className="modal-overlay absolute w-full h-full bg-gray-800 opacity-90"></div>

                    <div className="mx-auto w-[400px]  modal-container bg-white mx-auto rounded-lg shadow-lg z-50 overflow-y-auto p-8 text-center flex flex-col gap-5 items-center"
                    >
                        <button
                            onClick={cerrarModalYLimpiarDatos}
                            className="text-3xl w-full flex justify-end items-center text-gray-500 hover:text-gray-700 transition-colors duration-300">
                            <IoCloseCircle />
                        </button>

                        <p className='text-gray-500 font-bold text-5xl'><FaFilePdf /></p>

                        <p className='text-gray-500 font-bold text-xl'>¿Imprimir el informe?</p>
                        <div className='flex gap-5'>
                            <button className='bg-sky-600 hover:bg-sky-700 px-4 py-3 rounded-md shadow-md text-white font-medium flex gap-2 items-center' onClick={generatePDF}>Si</button>
                            <button className='bg-gray-500 hover:bg-gray-600 px-4 py-3 rounded-md shadow-md text-white font-medium flex gap-2 items-center' onClick={cerrarModalYLimpiarDatos}>Cancelar</button>
                        </div>
                    </div>

                </div>
            )}






        </div>


    );
}

export default TablaPpi;





