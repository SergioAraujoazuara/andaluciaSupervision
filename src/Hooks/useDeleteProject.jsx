import { useState } from 'react';
import { db } from '../../firebase_config';  // Asegúrate de que la ruta sea correcta
import { doc, deleteDoc } from 'firebase/firestore';

const useDeleteProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteProject = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const projectRef = doc(db, "proyectos", id);
      await deleteDoc(projectRef);  // Eliminar proyecto de Firestore

      setLoading(false);
      return "Proyecto eliminado exitosamente.";
    } catch (err) {
      setLoading(false);
      setError(err.message);
      return `Error al eliminar el proyecto: ${err.message}`;
    }
  };

  return { deleteProject, loading, error };
};

export default useDeleteProject;
