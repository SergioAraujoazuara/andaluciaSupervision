import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';
import { MdAttachFile } from "react-icons/md";
import { FaFilePdf } from "react-icons/fa6";

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 30,
        backgroundColor: '#FFFFFF',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    title: {
        fontSize: 10,
        color: '#333333',
        alignSelf: 'flex-start',
    },
    projectInfo: {
        width: '50%',
        textAlign: 'left',
    },
    imagesContainer: {
        width: '40%',
        textAlign: 'right',
    },
    image2: {
        width: 100,
        height: 50,
    },
    image: {
        width: 70,
        height: 40,
    },
    table: {
        display: 'table',
        width: 'auto',
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        borderRadius: 10,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
    },
    tableColHeader: {
        width: '8.33%',
        height: '100%',
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        backgroundColor: '#d1d5db',
        padding: 10,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 8
    },
    tableCol: {
        width: '8.33%',
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        borderTopWidth: 0,
        padding: 8,
        textAlign: 'center',
        alignSelf: 'center',
    },
    divider: {
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        borderTopWidth: 1,
        marginHorizontal: -30,
    },
    tableCellHeader: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        fontSize: 10,
        color: '#333333',
    },
    line: {
        width: 500
    },
});

const Pdf_final = ({ ppi, nombreProyecto, titulo, obra, tramo, imagenPath, imagenPath2, setShowConfirmModal }) => {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [additionalFiles, setAdditionalFiles] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const lote = localStorage.getItem('lote')
    const ppiname = localStorage.getItem('ppi')

    const openConfirmationModal = () => {
        setShowConfirmationModal(true);
    };

    const closeConfirmationModal = () => {
        setShowConfirmationModal(false);
    };

    const confirmPDFCreation = () => {
        combinePDFs();
        closeConfirmationModal();
        setShowConfirmModal(false)
    };

    const addMoreFiles = () => {
        setAdditionalFiles([...additionalFiles, { id: Date.now(), file: null }]);
    };

    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setAdditionalFiles(newFiles.map(file => ({ id: Date.now(), file })));
    };

    const handleAdditionalFileChange = (event, id) => {
        const { files } = event.target;
        const updatedFiles = additionalFiles.map(file =>
            file.id === id ? { ...file, file: files[0] } : file
        );
        setAdditionalFiles(updatedFiles);
    };

    useEffect(() => {
        const doc = (
            <Document>
                <Page size="A3" style={styles.page} orientation="landscape">
                    <View style={styles.titleContainer}>
                        <View style={styles.projectInfo}>
                            <Text style={{ ...styles.title, marginBottom: 4 }}>{nombreProyecto}</Text>
                            <Text style={{ ...styles.title, marginBottom: 4 }}>{titulo}</Text>
                            <Text style={{ ...styles.title, marginBottom: 4 }}>Obra: {obra}</Text>
                            <Text style={{ ...styles.title, marginBottom: 4 }}>Tramo: {tramo}</Text>
                        </View>

                        <View style={{ ...styles.imagesContainer, flexDirection: 'row', marginLeft: 500 }}>
                            <Image style={{ ...styles.image2, marginRight: 20 }} src={imagenPath2} />
                            <Image style={styles.image} src={imagenPath} />
                        </View>
                    </View>
                    <View>
                        <Text style={{ width: 1115, borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginBottom: 10 }}></Text>
                    </View>

                    <View style={styles.table}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Versión</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Número</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Actividad</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Criterio de Aceptación</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tipo de Inspección</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Documentación de referencia</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Punto</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Responsable</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Usuario</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Firma</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Comentarios</Text></View>
                            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Estado</Text></View>
                        </View>
                        {ppi && ppi.actividades.map((actividad, index) => (
                            <>
                                <View style={{ ...styles.tableRow, backgroundColor: '#e5e7eb' }} key={index}>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{actividad.numero}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}>{actividad.actividad}</Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                    <View style={styles.tableCol}><Text style={styles.tableCell}></Text></View>
                                </View>
                                <View style={styles.divider} key={`divider_${index}`} />
                                {actividad.subactividades.map((sub, subIndex) => (
                                    <>
                                        <View style={styles.tableRow} key={`sub_${index}_${subIndex}`}>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.version}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.numero}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.nombre}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.criterio_aceptacion}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.documentacion_referencia}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.tipo_inspeccion}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.punto}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.responsable}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.nombre_usuario}</Text></View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.fecha}</Text></View>
                                            <View style={styles.tableCol}>
                                                {sub.signature ? (
                                                    <Image style={styles.image} src={sub.signature} />
                                                ) : (
                                                    <Text style={styles.tableCell}></Text>
                                                )}
                                            </View>
                                            <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.comentario}</Text></View>
                                            <View style={styles.tableCol}>
                                                <Text style={{ ...styles.tableCell, ...styles.centeredContent, color: sub.resultadoInspeccion === 'Apto' ? '#15803d' : '#b91c1c' }}>
                                                    {sub.resultadoInspeccion}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.divider} key={`divider_sub_${index}_${subIndex}`} />
                                    </>
                                ))}
                            </>
                        ))}
                    </View>
                </Page>
            </Document>
        );

        const generatePdfBlob = async () => {
            const blob = await pdf(doc).toBlob();
            setPdfBlob(blob);
            setLoading(false);
        };

        generatePdfBlob();
    }, []);

    const combinePDFs = async () => {
        if (!pdfBlob) {
            console.error("Falta el PDF inicial.");
            return;
        }

        const mergedPdf = await PDFDocument.create();
        const pdfBytes = await pdfBlob.arrayBuffer();
        const existingPdfDoc = await PDFDocument.load(pdfBytes);

        const copiedPages = await mergedPdf.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));

        if (additionalFiles.length > 0) {
            for (const file of additionalFiles) {
                const arrayBuffer = await readFileAsArrayBuffer(file.file);
                const newPdfDoc = await PDFDocument.load(arrayBuffer);
                const newPages = await mergedPdf.copyPages(newPdfDoc, newPdfDoc.getPageIndices());
                newPages.forEach(page => mergedPdf.addPage(page));
            }
        }

        const finalPdfBytes = await mergedPdf.save();
        downloadPDF(finalPdfBytes, `${ppiname}_${lote}`);
    };

    const readFileAsArrayBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const downloadPDF = (pdfBytes, filename) => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    if (loading) {
        return (
            <div>
                {showConfirmationModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-90 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                            <p className="text-lg font-semibold mb-4">¿Estás seguro de que quieres crear el PDF final?</p>
                            <div className="flex justify-center gap-4">
                                <button className="bg-amber-700 text-white px-4 py-2 rounded-md" onClick={confirmPDFCreation}>Sí</button>
                                <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={closeConfirmationModal}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                {additionalFiles.length >= 0 && (
                    <div>
                        <div className='flex items-center gap-2 mb-3'>
                            <h2>Adjuntar archivos</h2>
                            <button className="text-gray-600 bg-gray-500 text-white rounded-md px-3 py-1 cursor-pointer" onClick={addMoreFiles}>
                                <span className='font-bold text-lg'><MdAttachFile /></span>
                            </button>
                        </div>
                        <p className='text-sm'><span className='text-amber-600'>* </span>
                            Presiona el boton de adjuntar para generar nuevos campos de entrada de archivos</p>
                    </div>
                )}

                {additionalFiles.map((file, index) => (
                    <div key={file.id} className="mt-3 flex items-center">
                        <p className="mr-2">{index + 1}.</p>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(event) => handleAdditionalFileChange(event, file.id)}
                        />
                    </div>
                ))}

                <div className='mt-8'>
                    <button className='bg-amber-600 text-white font-medium px-4 py-2 rounded-lg flex gap-2 items-center' onClick={openConfirmationModal}>
                        <span><FaFilePdf /></span> Crear PDF final
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {showConfirmationModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-90 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold mb-4">¿Estás seguro de que quieres crear el PDF final?</p>
                        <div className="flex justify-center gap-4">
                            <button className="bg-amber-700 text-white px-4 py-2 rounded-md" onClick={confirmPDFCreation}>Sí</button>
                            <button className="bg-gray-500 text-white px-4 py-2 rounded-md" onClick={closeConfirmationModal}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {additionalFiles.length >= 0 && (
                <div>
                    <div className='flex items-center gap-2 mb-3'>
                        <h2>Adjuntar archivos</h2>
                        <button className="text-gray-600 bg-gray-500 text-white rounded-md px-3 py-1 cursor-pointer" onClick={addMoreFiles}>
                            <span className='font-bold text-lg'><MdAttachFile /></span>
                        </button>
                    </div>
                    <p className='text-sm'><span className='text-amber-600'>* </span>
                        Presiona el boton de adjuntar para generar nuevos campos de entrada de archivos</p>
                </div>
            )}

            {additionalFiles.map((file, index) => (
                <div key={file.id} className="mt-3 flex items-center">
                    <p className="mr-2">{index + 1}.</p>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(event) => handleAdditionalFileChange(event, file.id)}
                    />
                </div>
            ))}

            <div className='mt-8'>
                <button className='bg-amber-600 text-white font-medium px-4 py-2 rounded-lg flex gap-2 items-center' onClick={openConfirmationModal}>
                    <span><FaFilePdf /></span> Crear PDF final
                </button>
            </div>
        </div>
    );
};

export default Pdf_final;
