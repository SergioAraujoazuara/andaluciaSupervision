import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase_config";

const PdfCreator = ({
    progresoGeneralObra,
    inspeccionesTerminadas,
    totalLotes,
    lotesIniciados,
    porcentajeInspeccionesCompletadas,
    timelineRef,
    aptoNoAptoRef,
    graficaLotesRef,
    sectorsData = []
}) => {
    const [proyecto, setProyecto] = useState(null);

    useEffect(() => {
        const fetchProyecto = async () => {
            const idProyecto = localStorage.getItem("idProyecto");
            if (!idProyecto) {
                console.error("No se encontró el ID del proyecto en localStorage.");
                return;
            }

            const proyectoRef = doc(db, "proyectos", idProyecto);
            const proyectoSnap = await getDoc(proyectoRef);

            if (proyectoSnap.exists()) {
                setProyecto(proyectoSnap.data());
            } else {
                console.error("No se encontró el proyecto en la base de datos.");
            }
        };

        fetchProyecto();
    }, []);

    const generatePDF = async () => {
        const pdf = new jsPDF('portrait', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        let yPosition = 80;

        // Estilos corporativos
        const primaryColor = '#ffffff';
        const secondaryColor = '#475569';

        // Encabezado corporativo
        pdf.setFillColor(primaryColor);
        pdf.rect(0, 0, pageWidth, 50, 'F');
        pdf.setTextColor(secondaryColor);
        pdf.setFontSize(18);
        pdf.text('Reporte de Inspección de Obras', pageWidth / 2, 30, { align: 'center' });

        // Agregar logos si están disponibles
        if (proyecto?.logo || proyecto?.logoCliente) {
            const logoSize = 50;
            const logoMargin = 10;
            let xPosition = pageWidth - (logoSize * 2 + logoMargin);

            if (proyecto?.logo) {
                const imgData = await fetch(proyecto.logo).then(res => res.blob()).then(blob => URL.createObjectURL(blob));
                pdf.addImage(imgData, 'JPEG', xPosition, 10, logoSize, logoSize);
                xPosition += logoSize + logoMargin;
            }

            if (proyecto?.logoCliente) {
                const imgData = await fetch(proyecto.logoCliente).then(res => res.blob()).then(blob => URL.createObjectURL(blob));
                pdf.addImage(imgData, 'JPEG', xPosition, 10, logoSize, logoSize);
            }
        }

        // Restablecemos el color de texto para el contenido
        pdf.setTextColor(40, 40, 40);

        // Información general en una sección bien estructurada
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor);
        pdf.text('Resumen de Inspección', 40, yPosition);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(40, yPosition + 5, pageWidth - 40, yPosition + 5);
        yPosition += 30;

        pdf.setFontSize(12);
        pdf.setTextColor(secondaryColor);
        pdf.text(`Progreso General de la Obra (Total aptos): ${progresoGeneralObra}%`, 40, yPosition);
        pdf.text(`Inspecciones completadas: ${inspeccionesTerminadas} / ${totalLotes}`, 40, yPosition + 20);
        pdf.text(`Porcentaje de Inspecciones Completadas: ${porcentajeInspeccionesCompletadas}%`, 40, yPosition + 40);
        pdf.text(`Lotes Iniciados: ${lotesIniciados}`, 40, yPosition + 60);
        yPosition += 90;

        // Resumen por sector en forma de tabla
        if (sectorsData.length > 0) {
            pdf.setFontSize(14);
            pdf.setTextColor(primaryColor);
            pdf.text('Resumen por Sector', 40, yPosition);
            pdf.setDrawColor(200, 200, 200);
            pdf.line(40, yPosition + 5, pageWidth - 40, yPosition + 5);
            yPosition += 20;

            pdf.setFontSize(12);
            pdf.text('Sector', 40, yPosition);
            pdf.text('Aptos', 180, yPosition);
            pdf.text('No Aptos', 280, yPosition);
            pdf.text('Total', 380, yPosition);
            pdf.text('Progreso', 480, yPosition);
            yPosition += 20;

            sectorsData.forEach((sector) => {
                pdf.setFontSize(12);
                pdf.setTextColor(secondaryColor);
                pdf.text(sector.name, 40, yPosition);
                pdf.text(`${sector.aptos}`, 180, yPosition);
                pdf.text(`${sector.noAptos}`, 280, yPosition);
                pdf.text(`${sector.total}`, 380, yPosition);

                const completionPercentage = ((sector.aptos / (sector.total || 1)) * 100).toFixed(2);
                pdf.text(`${completionPercentage}%`, 480, yPosition);

                yPosition += 20;

                if (yPosition > pageHeight - 100) {
                    pdf.addPage();
                    yPosition = 40;
                }
            });
        } else {
            pdf.setFontSize(12);
            pdf.setTextColor(secondaryColor);
            pdf.text("No hay datos disponibles de los sectores.", 40, yPosition);
        }

        // Añadir las imágenes
        const imgWidth = pageWidth * 0.80;
        const fixedImgHeight = 280;
        const gap = 40;

        const addImagesInRowToPDF = async (refs, labels) => {
            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                const label = labels[i];

                if (ref.current) {
                    const canvas = await html2canvas(ref.current, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');

                    if (yPosition + fixedImgHeight > pageHeight - 80) {
                        pdf.addPage();
                        yPosition = 40;
                    }

                    pdf.setFontSize(10);
                    pdf.setTextColor(primaryColor);
                    pdf.text(label, 40, yPosition - 10);
                    pdf.addImage(imgData, 'PNG', 40, yPosition, imgWidth, fixedImgHeight);

                    yPosition += fixedImgHeight + gap;
                }
            }
        };

        await addImagesInRowToPDF(
            [timelineRef, aptoNoAptoRef, graficaLotesRef],
            ["Progreso de Inspecciones en el Tiempo", "Distribución de Inspecciones Aptas/No Aptas", "Lotes por Sector"]
        );

        // Pie de página
        pdf.setFillColor(primaryColor);
        pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('Generado automáticamente por el sistema de inspección de obras', pageWidth / 2, pageHeight - 15, { align: 'center' });

        pdf.save('Reporte_Inspeccion.pdf');
    };

    return (
        <div className="text-center mt-4">
            <button onClick={generatePDF} className="bg-blue-500 text-white py-2 px-4 rounded">
                Generar PDF
            </button>
        </div>
    );
};

export default PdfCreator;
