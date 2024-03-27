import React, { useState } from 'react'
import jsPDF from 'jspdf';
import logo from '../assets/tpf_logo_azul.png'

function RecuperarPdf({documentoFormulario}) {
    const titulo = "REGISTRO DE INSPECCIÓN DE OBRA REV-1"
    const [nombreProyecto, setNombreProyecto] = useState(localStorage.getItem('nombre_proyecto') || '');
    const imagenPath = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Adif_wordmark.svg/1200px-Adif_wordmark.svg.png"
    const imagenPath2 = logo

    
    

    const generatePDF = () => {
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
        doc.text(`Obra: ${documentoFormulario.obra}`, 15, 40);
        doc.text(`Tramo: ${documentoFormulario.tramo}`, 15, 45);
        doc.text(`Nº de registro: ${documentoFormulario.numeroRegistro}`, 150, 40);
        doc.text(`Fecha: ${documentoFormulario.fechaHoraActual}`, 150, 45);


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
        doc.text(`PPI: ${documentoFormulario.ppiNombre}`, 15, 60);
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
        const textoObservaciones = `Observaciones: ${documentoFormulario.observaciones}`;

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
        doc.text(`Sector: ${documentoFormulario.sector}`, 15, 100);
        doc.text(`Subsector: ${documentoFormulario.subSector}`, 15, 110);
        doc.text(`Parte: ${documentoFormulario.parte}`, 15, 120);
        doc.text(`Elemento: ${documentoFormulario.elemento}`, 15, 130);
        doc.text(`Lote: ${documentoFormulario.lote}`, 15, 140);
        doc.text(`Pk inicial: ${documentoFormulario.pkInicial}`, 15, 150);
        doc.text(`Pk final: ${documentoFormulario.pkFinal}`, 15, 160);

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

        // // Agregar imagen al PDF dentro del recuadro 6
        // if (imagen) {
        //     doc.addImage(imagen, 'JPEG', 25, 180, 70, 50); // Ajusta las coordenadas y el tamaño según necesites
        // }
        // if (imagen2) {
        //     doc.addImage(imagen2, 'JPEG', 110, 180, 70, 50); // Ajusta las coordenadas y el tamaño según necesites
        // }

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
        doc.text('Resultado de la inspección', 150, 250);
        // doc.text(documentoFormulario.resultadoInspeccion, 150, 260);
        doc.text(`Firmado electronicamente con blockchain`, 15, 250);
        // Asegúrate de que la firma es una cadena y no está vacía
        doc.text(documentoFormulario.firma, 15, 260);
        doc.save('formulario.pdf');
    };

    
  return (
    <div>RecuperarPdf</div>
  )
}

export default RecuperarPdf