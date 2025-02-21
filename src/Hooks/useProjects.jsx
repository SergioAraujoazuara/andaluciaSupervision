// useProjects.js
import { useState, useEffect } from 'react';
import { db } from '../../firebase_config';  // Asegúrate de ajustar la ruta según tu proyecto
import { collection, getDocs } from 'firebase/firestore';

// Hook para obtener proyectos desde Firestore
const useProjects = () => {
  const [projects, setProjects] = useState([]);  // Estado para almacenar los proyectos
  const [loading, setLoading] = useState(true);  // Estado para mostrar si estamos cargando

  // Función para obtener los proyectos
  const fetchProjects = async () => {
    try {
      const projectsCollection = collection(db, 'proyectos'); // Referencia a la colección "proyectos"
      const projectsSnapshot = await getDocs(projectsCollection);  // Obtener los documentos de la colección
      const projectsList = projectsSnapshot.docs.map(doc => ({
        id: doc.id,  // Obtenemos el ID del documento
        ...doc.data(),  // Obtenemos los datos del documento
      }));
      setProjects(projectsList);  // Guardamos los proyectos en el estado
    } catch (error) {
      console.error('Error obteniendo los proyectos: ', error);
    } finally {
      setLoading(false);  // Cambiamos el estado de "loading" a false cuando terminamos de cargar
    }
  };

  // useEffect para obtener proyectos al montar el componente
  useEffect(() => {
    fetchProjects();  // Llamamos a la función para obtener los proyectos cuando el componente se monta
  }, []);  // Este hook solo se ejecuta una vez, cuando el componente se monta

  // Función para refrescar los proyectos después de agregar, editar o eliminar uno
  const refreshProjects = () => {
    fetchProjects(); // Vuelve a obtener los proyectos después de una modificación
  };

  return { projects, loading, refreshProjects };  // Devolvemos los proyectos, el estado de carga y la función para refrescar
};

export default useProjects;
