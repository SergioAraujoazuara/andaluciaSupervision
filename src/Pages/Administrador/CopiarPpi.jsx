import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase_config';
import { getDocs, collection, doc, setDoc } from 'firebase/firestore';

function CopiarPpi() {
    const [ppis, setPpis] = useState([]);
    const [selectedPpi, setSelectedPpi] = useState("");
    const [newPpiName, setNewPpiName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Load PPIs from Firestore
    const cargarPpis = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "ppis"));
            const ppisList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPpis(ppisList);
        } catch (error) {
            console.error("Error al cargar los PPIs:", error);
            setErrorMessage("Hubo un error al cargar los PPIs");
        }
    };

    useEffect(() => {
        cargarPpis();
    }, []);

    // Function to copy a PPI with a new name
    const copiarPpi = async () => {
        if (!selectedPpi || !newPpiName.trim()) {
            setErrorMessage("Por favor, selecciona un PPI y proporciona un nombre para la copia.");
            return;
        }

        try {
            // Get the selected PPI data
            const ppiToCopy = ppis.find(ppi => ppi.id === selectedPpi);

            if (!ppiToCopy) {
                setErrorMessage("PPI no encontrado.");
                return;
            }

            // Create a new PPI with the same data but a different name
            const newPpiData = { ...ppiToCopy, nombre: newPpiName };

            // Add the new PPI to Firestore
            const newDocRef = doc(collection(db, "ppis"));
            await setDoc(newDocRef, newPpiData);

            setSuccessMessage("El PPI ha sido copiado exitosamente.");
            setNewPpiName(""); // Reset the new name input
            setSelectedPpi(""); // Reset the selected PPI
        } catch (error) {
            console.error("Error al copiar el PPI:", error);
            setErrorMessage("Hubo un problema al intentar copiar el PPI.");
        }
    };

    return (
        <div className='container mx-auto min-h-screen px-6 py-2 text-gray-500 mt-5'>
            <div className='flex flex-col gap-4'>
      

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg">{errorMessage}</div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="bg-green-100 text-green-700 p-3 rounded-lg">{successMessage}</div>
                )}

                {/* PPI Selection */}
                <div>
                    <label htmlFor="ppiSelect" className="block text-sm font-medium text-gray-700">
                        Selecciona un PPI a copiar
                    </label>
                    <select
                        id="ppiSelect"
                        value={selectedPpi}
                        onChange={(e) => setSelectedPpi(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                    >
                        <option value="">Selecciona un PPI</option>
                        {ppis.map((ppi) => (
                            <option key={ppi.id} value={ppi.id}>
                                {ppi.nombre} (V-{ppi.version})
                            </option>
                        ))}
                    </select>
                </div>

                {/* New Name Input */}
                <div className="mt-4">
                    <label htmlFor="newPpiName" className="block text-sm font-medium text-gray-700">
                        Nuevo nombre para la copia
                    </label>
                    <input
                        type="text"
                        id="newPpiName"
                        value={newPpiName}
                        onChange={(e) => setNewPpiName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Introduce un nuevo nombre para el PPI"
                    />
                </div>

                {/* Copy Button */}
                <div className="mt-4">
                    <button
                        onClick={copiarPpi}
                        className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
                    >
                        Copiar PPI
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CopiarPpi;
