const uploadPdfToStorage = async (pdfBlob, projectId) => {
    try {
        const fechaHora = new Date().toISOString().replace(/:/g, "-").split(".")[0];
        const fileName = `informes/${projectId}_${fechaHora}.pdf`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, pdfBlob);
        const downloadURL = await getDownloadURL(storageRef);

        console.log("✅ Informe guardado en:", downloadURL);
        return downloadURL; // Devuelve la URL del archivo subido
    } catch (error) {
        console.error("❌ Error al subir el PDF a Firebase Storage:", error);
        return null;
    }
};
