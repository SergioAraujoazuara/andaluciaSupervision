import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        padding: 30,
        backgroundColor: '#FFFFFF',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
       
        marginBottom: 20,
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
        backgroundColor: '#f9fafb', // Cambio de color a gris claro
    },
    tableColHeader: {
        width: '10%',
        height: '100%',
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        backgroundColor: '#0369a1',
        padding: 10,
        textAlign: 'center',
        alignSelf: 'center',
        fontSize: 8
    },
    tableCol: {
        width: '10%',
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        borderTopWidth: 0, // Eliminar la línea superior para evitar duplicados
        padding: 8,
        textAlign: 'center',
        alignSelf: 'center'
    },
    divider: {
        borderStyle: 'solid',
        borderColor: '#CCCCCC',
        borderTopWidth: 1,
        marginHorizontal: -30,
    },
    tableCellHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    tableCell: {
        fontSize: 10,
        color: '#333333',
    }
});

const Pdf_final = ({ ppi, nombreProyecto, titulo, obra, tramo, imagenPath, imagenPath2 }) => {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [additionalFiles, setAdditionalFiles] = useState([]);

    useEffect(() => {
        const doc = (
            <Document>
            <Page size="A3" style={styles.page} orientation="landscape">
                <View style={styles.titleContainer}>
                    <View style={styles.projectInfo}>
                        <Text style={styles.title}>Nombre del Proyecto: {nombreProyecto}</Text>
                        <Text style={styles.title}>Título: {titulo}</Text>
                        <Text style={styles.title}>Obra: {obra}</Text>
                        <Text style={styles.title}>Tramo: {tramo}</Text>
                    </View>

                    <View style={{ ...styles.imagesContainer, flexDirection: 'row', marginLeft:500 }}>
                        {/* Aquí puedes agregar tus imágenes */}
                        <Image style={{...styles.image2, marginRight:20}} src={imagenPath2} />
                        <Image style={styles.image} src={imagenPath} />
                    </View>
                </View>

                <View style={styles.table}>
                    {/* Cabeceras de la tabla */}
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Versión</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Número</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Actividad</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Criterio de Aceptación</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tipo de Inspección</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Documentación de referencia</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Punto</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Responsable</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Fecha</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Comentarios</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Estado</Text></View>
                    </View>
                    {/* Datos de las actividades y subactividades */}
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
                            {/* Línea divisoria */}
                            <View style={styles.divider} key={`divider_${index}`} />
                            {/* Subactividades */}
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
                                        <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.fecha}</Text></View>
                                        <View style={styles.tableCol}><Text style={styles.tableCell}>{sub.comentario}</Text></View>
                                        <View style={styles.tableCol}>
                                            <Text style={{ ...styles.tableCell, ...styles.centeredContent, color: sub.resultadoInspeccion === 'Apto' ? '#15803d' : '#b91c1c' }}>
                                                {sub.resultadoInspeccion}
                                            </Text>
                                        </View>
                                    </View>
                                    {/* Línea divisoria */}
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

    const handleFileChange = (event) => {
        setAdditionalFiles(event.target.files);
    };

    const combinePDFs = async () => {
        if (!pdfBlob || additionalFiles.length === 0) {
            console.error("Falta el PDF inicial o los archivos adicionales.");
            return;
        }

        const mergedPdf = await PDFDocument.create();
        const pdfBytes = await pdfBlob.arrayBuffer();
        const existingPdfDoc = await PDFDocument.load(pdfBytes);

        // Copiar todas las páginas del PDF inicial
        const copiedPages = await mergedPdf.copyPages(existingPdfDoc, existingPdfDoc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));

        // Copiar todas las páginas de los archivos adicionales
        for (const file of additionalFiles) {
            const newPdfBytes = await file.arrayBuffer();
            const newPdfDoc = await PDFDocument.load(newPdfBytes);
            const newPages = await mergedPdf.copyPages(newPdfDoc, newPdfDoc.getPageIndices());
            newPages.forEach(page => mergedPdf.addPage(page));
        }

        const finalPdfBytes = await mergedPdf.save();
        downloadPDF(finalPdfBytes, 'final_document.pdf');
    };

    const downloadPDF = (pdfBytes, filename) => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
            <button className='bg-amber-600 text-white font-medium px-4 py-2 rounded-lg'
                onClick={combinePDFs}>
                Combina y descarga PDF
            </button>
        </div>
    );
};

export default Pdf_final;
