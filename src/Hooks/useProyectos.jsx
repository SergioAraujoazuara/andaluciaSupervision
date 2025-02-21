import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase_config"; // Asegúrate de ajustar esta ruta según tu proyecto

const useProyecto = (projectId) => {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProyecto = async () => {
      if (!projectId) {
        setError("No se encontró el ID del proyecto.");
        setLoading(false);
        return;
      }

      try {
        const proyectoRef = doc(db, "proyectos", projectId);
        const proyectoSnap = await getDoc(proyectoRef);

        if (proyectoSnap.exists()) {
          setProyecto(proyectoSnap.data());
        } else {
          setError("No se encontró el proyecto en la base de datos.");
        }
      } catch (err) {
        console.error("Error al obtener el proyecto:", err);
        setError("Error al obtener el proyecto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProyecto();
  }, [projectId]);

  return { proyecto, loading, error };
};

export default useProyecto;
