import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PdfCreator = ({ 
    progresoGeneralObra, 
    inspeccionesTerminadas, 
    totalLotes, 
    lotesIniciados, 
    porcentajeInspeccionesCompletadas, 
    timelineRef, 
    aptoNoAptoRef, 
    graficaLotesRef,
    sectorsData = [] // Valor predeterminado a una matriz vacía
}) => {
    const generatePDF = async () => {
        const pdf = new jsPDF('portrait', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        let yPosition = 80;

        // Estilos corporativos
        const primaryColor = '#004080';
        const secondaryColor = '#808080';

        // Encabezado corporativo
        pdf.setFillColor(primaryColor);
        pdf.rect(0, 0, pageWidth, 50, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(18);
        pdf.text('Reporte de Inspección de Obras', pageWidth / 2, 30, { align: 'center' });

        // Restablecemos el color de texto para el contenido
        pdf.setTextColor(40, 40, 40);

        // Información general en una sección bien estructurada
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor);
        pdf.text('Resumen de Inspección', 40, yPosition);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(40, yPosition + 5, pageWidth - 40, yPosition + 5); // Línea divisoria
        yPosition += 30;

        pdf.setFontSize(12);
        pdf.setTextColor(secondaryColor);
        pdf.text(`Progreso General de la Obra: ${progresoGeneralObra}%`, 40, yPosition);
        pdf.text(`Inspecciones Terminadas: ${inspeccionesTerminadas} / ${totalLotes}`, 40, yPosition + 20);
        pdf.text(`Lotes Iniciados: ${lotesIniciados}`, 40, yPosition + 40);
        pdf.text(`Porcentaje de Inspecciones Completadas: ${porcentajeInspeccionesCompletadas}%`, 40, yPosition + 60);
        yPosition += 90;

        // Añadir información de cada sector (Aptos/No Aptos)
        pdf.setFontSize(14);
        pdf.setTextColor(primaryColor);
        pdf.text('Resumen por Sector', 40, yPosition);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(40, yPosition + 5, pageWidth - 40, yPosition + 5); // Línea divisoria
        yPosition += 20;

        if (sectorsData.length > 0) {
            sectorsData.forEach((sector) => {
                pdf.setFontSize(12);
                pdf.setTextColor(secondaryColor);
                pdf.text(`Sector: ${sector.name}`, 40, yPosition);
                pdf.text(`Aptos: ${sector.aptos}`, 180, yPosition);
                pdf.text(`No Aptos: ${sector.noAptos}`, 280, yPosition);

                const completionPercentage = ((sector.aptos / (sector.aptos + sector.noAptos || 1)) * 100).toFixed(2);
                pdf.text(`Progreso: ${completionPercentage}%`, 380, yPosition);

                yPosition += 20;

                // Agregar nueva página si se alcanza el límite
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
        yPosition += 30;

        // Tamaño de imagen uniforme para todas las gráficas en el PDF
        const imgWidth = pageWidth * 0.4; // Ancho de cada imagen (40% de la página)
        const fixedImgHeight = 200; // Altura fija para mantener proporción y uniformidad
        const gap = 20; // Espacio entre imágenes

        // Función para agregar imágenes al PDF en una fila de dos
        const addImagesInRowToPDF = async (refs, labels) => {
            let xPosition = 40;

            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                const label = labels[i];

                if (ref.current) {
                    const canvas = await html2canvas(ref.current, { scale: 2 });
                    const imgData = canvas.toDataURL('image/png');

                    // Verificar si hay espacio suficiente en la página
                    if (yPosition + fixedImgHeight > pageHeight - 80) {
                        pdf.addPage();
                        yPosition = 40;
                    }

                    pdf.setFontSize(10);
                    pdf.setTextColor(primaryColor);
                    pdf.text(label, xPosition, yPosition - 10);
                    pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, fixedImgHeight);

                    // Si hemos agregado dos imágenes en la fila, ir a la siguiente fila
                    if (xPosition + imgWidth + gap > pageWidth - imgWidth) {
                        xPosition = 40;
                        yPosition += fixedImgHeight + 40; // Avanzar a la siguiente fila
                    } else {
                        // Si no, continuar en la misma fila
                        xPosition += imgWidth + gap;
                    }
                }
            }

            // Asegurar que `yPosition` avance a la siguiente fila después de la última imagen
            yPosition += fixedImgHeight + 40;
        };

        // Añadir las imágenes en filas de dos
        await addImagesInRowToPDF(
            [timelineRef, aptoNoAptoRef, graficaLotesRef],
            ["Progreso de Inspecciones en el Tiempo", "Distribución de Inspecciones Aptas/No Aptas", "Lotes por Sector"]
        );

        // Pie de página con detalles corporativos
        pdf.setFillColor(primaryColor);
        pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('Generado automáticamente por el sistema de inspección de obras', pageWidth / 2, pageHeight - 15, { align: 'center' });

        // Guardar el PDF
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
