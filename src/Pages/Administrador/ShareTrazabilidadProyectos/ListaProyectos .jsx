import React, { useEffect, useState } from "react";
import { db } from "../../../../firebase_config"; // Asegúrate de importar tu configuración de Firebase
import { collection, getDocs, doc } from "firebase/firestore"; // Importa las funciones necesarias de Firestore

const ListaProyectos = () => {
  const [proyectos, setProyectos] = useState([]); // Estado para almacenar los proyectos
  const [loading, setLoading] = useState(true); // Estado para manejar la carga de los proyectos

  // Función para obtener los proyectos desde Firestore
  const obtenerProyectos = async () => {
    try {
      const proyectosRef = collection(db, "proyectos"); // Consulta en la colección "proyectos"
      const proyectosSnapshot = await getDocs(proyectosRef); // Obtenemos todos los documentos
      const proyectosData = proyectosSnapshot.docs.map((doc) => ({
        id: doc.id, // ID del proyecto
        obra: doc.data().obra, // Nombre del proyecto
        ref: doc.ref, // Referencia al documento
      }));
      setProyectos(proyectosData); // Establecer el estado con los proyectos obtenidos
      setLoading(false); // Cambiar el estado de carga
    } catch (error) {
      console.error("Error al obtener los proyectos:", error);
      setLoading(false); // Cambiar el estado de carga en caso de error
    }
  };

  // Función para verificar si un documento tiene subcolecciones y ver su contenido recursivamente
  const obtenerSubcoleccionesRecursivas = async (docRef) => {
    try {
      // Intentamos acceder a la subcolección "sector"
      const subcoleccionRef = collection(docRef, "sector"); // Cambia el nombre de la subcolección por la que deseas verificar
      const snapshot = await getDocs(subcoleccionRef);
      
      if (snapshot.empty) {
        console.log("Este documento no tiene la subcolección 'sector' o está vacía.");
      } else {
        console.log("El documento tiene la subcolección 'sector'.");
        
        // Ahora recorremos los documentos dentro de la subcolección 'sector'
        snapshot.forEach(async (doc) => {
          console.log("Documento en 'sector' ID:", doc.id);
          console.log("Datos del documento 'sector':", doc.data());
          
          // Ahora verificamos si hay una subcolección llamada 'subSector' dentro de cada documento de 'sector'
          const subSectorRef = collection(doc.ref, "subsector"); // Accedemos a la subcolección 'subSector'
          const subSectorSnapshot = await getDocs(subSectorRef);
          
          if (subSectorSnapshot.empty) {
            console.log("Este documento de 'sector' no tiene subcolección 'subSector' o está vacía.");
          } else {
            console.log("El documento de 'sector' tiene la subcolección 'subSector'.");
            subSectorSnapshot.forEach((subSectorDoc) => {
              console.log("Documento en 'subSector' ID:", subSectorDoc.id);
              console.log("Datos del documento 'subSector':", subSectorDoc.data());
            });
          }
        });
      }
    } catch (error) {
      console.error("Error al verificar subcolecciones:", error);
    }
  };

  // Llamada a la función obtenerProyectos cuando el componente se monta
  useEffect(() => {
    obtenerProyectos();
  }, []); // Este useEffect se ejecuta solo una vez al montar el componente

  // Función para manejar el click del proyecto
  const handleProjectClick = (proyecto) => {
    console.log(`Proyecto seleccionado: ${proyecto.obra}`);
    obtenerSubcoleccionesRecursivas(proyecto.ref); // Verificar si tiene subcolecciones recursivas
  };

  if (loading) return <p>Cargando proyectos...</p>; // Mensaje mientras se cargan los proyectos

  return (
    <div>
      <h1 className="font-bold text-4xl">Lista de Proyectos</h1>
      <ul>
        {proyectos.map((proyecto) => (
          <li
            key={proyecto.id}
            className="mt-5 cursor-pointer hover:text-green-700"
            onClick={() => handleProjectClick(proyecto)} // Al hacer clic, se verifica si tiene subcolecciones
          >
            {proyecto.obra}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaProyectos;
