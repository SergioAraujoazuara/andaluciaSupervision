import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase_config";

/**
 * Hook personalizado para obtener los detalles del usuario autenticado.
 * 
 * @param {string} userId - ID del usuario autenticado.
 * @returns {Object} - Objeto con el estado del usuario y posibles errores.
 */
const useUsuario = (userId) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    const fetchUsuario = async () => {
      try {
        const userDocRef = doc(db, "usuarios", userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUsuario(userDoc.data());
        } else {
          setUsuario(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [userId]);

  return { usuario, loading, error };
};

export default useUsuario;
