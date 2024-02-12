import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { db } from '../../../firebase_config';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoAddCircle } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";





function ViewProject() {

  
  // Variables de estado
  
  const nombre_proyecto = localStorage.getItem('nombre_proyecto')
  
  const [proyectos, setProyectos] = useState([])
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState(null);

  // Obtener proyectos
  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const proyectosCollection = collection(db, 'proyectos');
        const proyectosSnapshot = await getDocs(proyectosCollection);

        const proyectosData = proyectosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProyectos(proyectosData)
      } catch (error) {
        console.error('Error al obtener la lista de proyectos:', error);
      }
    };

    obtenerProyectos();
  }, []);


  // Función para mostrar el modal de confirmación y configurar el proyecto a eliminar
  const confirmDeleteProyecto = (proyectoId) => {
    setProyectoToDelete(proyectoId);
    setShowConfirmationModal(true);
  };

  // Función para cerrar el modal de confirmación sin eliminar el proyecto
  const cancelDeleteProyecto = () => {
    setProyectoToDelete(null);
    setShowConfirmationModal(false);
  };

  // Función para eliminar un proyecto
  const eliminarProyecto = async (id) => {
    try {
      await deleteDoc(doc(db, 'proyectos', id));
      // Actualizar la lista de proyectos después de eliminar uno
      setProyectos(proyectos.filter(proyecto => proyecto.id !== id));
      console.log('Proyecto eliminado correctamente');
      setShowConfirmationModal(false); // Ocultar el modal después de eliminar
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
    }
  };


  return (
    <div className='min-h-screen px-14 py-5 text-gray-500'>

      <div className='flex gap-2 items-center justify start bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
        <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
        <Link to={'/'}>
          <h1 className='font-ligth text-gray-500'>Inicio</h1>
        </Link>
        <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
        <Link to={'/admin'}>
          <h1 className='text-gray-600'>Administración</h1>
        </Link>
        <FaArrowRight style={{ width: 15, height: 15, fill: '#d97706' }} />
        <Link to={'#'}>
          <h1 className='font-medium text-amber-600'>Ver proyectos</h1>
        </Link>
    
      </div>



      <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

        <div className='flex gap-2 items-center'>

        <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-lg shadow-md'>{nombre_proyecto}</button>
        </div>

        <div className='border-t-2 w-full p-0 m-0'></div>




        <div class="w-full rounded rounded-xl  mt-5">
          <div className='grid sm:grid-cols-8 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
            <div className='text-left ps-2 font-medium text-gray-600 sm:block hidden'>Logo</div>
            <div className='sm:col-span-1 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Nombre</div>
            <div className='sm:col-span-1 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Contrato</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Descripción</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Acciones</div>
          </div>

          {proyectos.map((p, i) => (
            <div className='cursor-pointer grid sm:grid-cols-8 grid-cols-1 items-center justify-start sm:p-5 border-b-2'>
              <div className='sm:border-r-2 sm:border-b-0 flex items-center'>
                <img className='sm:w-10 SM:H-10 w-60 ' src={p.logo} alt="logo" />
              </div>

              <div className='sm:col-span-1 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                {p.nombre_corto}
              </div>

              <div className='sm:col-span-1 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                {p.codigoTpf}
              </div>

              <div className='sm:col-span-2 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                {p.nombre_completo}

              </div>
              <div className='sm:col-span-2 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                <button className='text-sky-600 px-3 py-1 text-lg flex items-center gap-1'> <IoAddCircle /> <p className='text-base'> Actividades</p> </button>
                <button className='text-sky-600 px-3 py-1 text-lg flex items-center gap-1'> <IoAddCircle /> <p className='text-base'> PPI</p> </button>
                <Link to={`/editProject/${p.id}`}>
                  <button className='text-gray-600 px-3 py-1 text-2xl'> <FaRegEdit /></button>
                </Link>
                <button onClick={() => confirmDeleteProyecto(p.id)} className='text-red-600 px-3 py-1 text-2xl'> <MdDelete /></button>



              </div>

            </div>
          ))}

          {/* Modal de confirmación */}
          {showConfirmationModal && (
            <div className="fixed inset-0 z-10 overflow-y-auto flex justify-center items-center bg-black bg-opacity-70">
              <div className="bg-white p-5 rounded-lg text-center">
                <p>¿Estás seguro que quieres eliminar este proyecto?</p>
                <div className="mt-4 flex justify-center">
                  <button onClick={() => eliminarProyecto(proyectoToDelete)} className="bg-red-600 hover:bg-red-600 text-white font-bold py-2 px-4 mr-4 rounded">Aceptar</button>
                  <button onClick={cancelDeleteProyecto} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">Cancelar</button>
                </div>
              </div>
            </div>
          )}



        </div>

      </div>







    </div>
  )
}

export default ViewProject