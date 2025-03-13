import { useState } from 'react';
import { db, storage } from '../../firebase_config';  // Asegúrate de que la ruta sea correcta
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Hook para agregar proyectos
const useAddProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para agregar el proyecto
  const addProject = async (empresa, work, descripcion, contract, logo, clientLogo, promotor, plazo, presupuesto, coordinador, director) => {
    setLoading(true);
    setError(null);  // Limpiamos el error

    try {
      // Subir logo del proyecto si existe
      let logoURL = null;
      if (logo) {
        const logoRef = ref(storage, `logos/${logo.name}`);
        await uploadBytes(logoRef, logo);
        logoURL = await getDownloadURL(logoRef);
      }

      // Subir logo del cliente si existe
      let clientLogoURL = null;
      if (clientLogo) {
        const clientLogoRef = ref(storage, `logos_clientes/${clientLogo.name}`);
        await uploadBytes(clientLogoRef, clientLogo);
        clientLogoURL = await getDownloadURL(clientLogoRef);
      }

      // Agregar proyecto a Firestore
      const projectsCollection = collection(db, "proyectos");
      await addDoc(projectsCollection, {
        empresa,
        obra: work,
        descripcion,
        promotor,
        contrato: contract,
        logo: logoURL,
        logoCliente: clientLogoURL,
        plazo: plazo,
        presupuesto: presupuesto,
        coordinador: coordinador,
        director: director,
      });

      setLoading(false);
      return "Proyecto agregado exitosamente.";
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return `Error al agregar el proyecto: ${err.message}`;
    }
  };

  return { addProject, loading, error };
};

export default useAddProject;
