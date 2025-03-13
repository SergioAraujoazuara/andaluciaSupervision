import { useState } from 'react';
import { db, storage } from '../../firebase_config';  // Asegúrate de que la ruta sea correcta
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const useUpdateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProject = async (id, empresa, work, descripcion, contract, logo, clientLogo, promotor, plazo, presupuesto, coordinador, director) => {
    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, "proyectos", id);

      let updatedData = {};
      if (empresa) updatedData.empresa = empresa;
      if (work) updatedData.obra = work;
      if (descripcion) updatedData.descripcion = descripcion;
      if (promotor) updatedData.promotor = promotor;
      if (contract) updatedData.contrato = contract;
      if (plazo) updatedData.plazo = plazo;
      if (presupuesto) updatedData.presupuesto = presupuesto;
      if (coordinador) updatedData.coordinador = coordinador;
      if (director) updatedData.director = director;

      if (logo) {
        const logoRef = ref(storage, `logos/${logo.name}`);
        await uploadBytes(logoRef, logo);
        const logoURL = await getDownloadURL(logoRef);
        updatedData.logo = logoURL;
      }

      if (clientLogo) {
        const clientLogoRef = ref(storage, `logos_clientes/${clientLogo.name}`);
        await uploadBytes(clientLogoRef, clientLogo);
        const clientLogoURL = await getDownloadURL(clientLogoRef);
        updatedData.logoCliente = clientLogoURL;
      }

      await updateDoc(projectRef, updatedData);  // Actualizar proyecto en Firestore

      setLoading(false);
      return "Proyecto actualizado exitosamente.";
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return `Error al actualizar el proyecto: ${err.message}`;
    }
  };

  return { updateProject, loading, error };
};

export default useUpdateProject;
