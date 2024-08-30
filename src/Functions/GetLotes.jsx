// src/utils/fetchLotes.js
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_config'; // Asegúrate de que la ruta a tu configuración de Firebase sea correcta

// Función para obtener los lotes desde Firestore
export const getLotes = async () => {
  try {
    const lotesCollectionRef = collection(db, "lotes");
    const lotesSnapshot = await getDocs(lotesCollectionRef);
    const lotesData = lotesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return lotesData;
  } catch (error) {
    console.error('Error al obtener los lotes:', error);
    return [];
  }
};
