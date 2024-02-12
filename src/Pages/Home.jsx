import React, { useEffect, useState } from 'react'
import { db } from '../../firebase_config';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

import { GoHomeFill } from "react-icons/go";

import { Link } from 'react-router-dom';




function Home() {
  const [proyectos, setProyectos] = useState([])

  

  const obtenerProyecto = (p) => {
    localStorage.setItem('nombre_proyecto', p.nombre_corto)
  }
  const nombre_proyectoStorage = ''

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
  return (
    <div className='min-h-screen px-14 py-5 text-gray-500'>

      <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>
        <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
        <Link to={'/'}>
          <h1 className='font-medium text-gray-500 text-amber-600'>Inicio</h1>
        </Link>
        <button className='bg-sky-600 text-white text-base font-medium px-5 py-2 rounded-md shadow-md' style={{ marginLeft: 'auto' }}>{nombre_proyectoStorage}</button>
      </div>



      <div className='flex gap-3 flex-col  mt-5 bg-white p-8 rounded rounded-xl shadow-md'>

        <div className='flex gap-2 items-center'>

          <h1 className='font-bold text-xl text-gray-500  px-5 '>Tus proyectos</h1>
        </div>

        <div className='border-t-2 w-full p-0 m-0'></div>




        <div class="w-full rounded rounded-xl  mt-5">
          <div className='grid sm:grid-cols-8 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
            <div className='text-left ps-2 font-medium text-gray-600 sm:block hidden'>Logo</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Nombre</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Contrato</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Ubicación</div>
          </div>



          {proyectos.map((p, i) => (
            <Link to={'/ppi'} onClick={() => obtenerProyecto(p)}>
              <div className='cursor-pointer grid sm:grid-cols-8 grid-cols-1 items-center justify-start sm:p-5 border-b-2'>
                <div className='sm:border-r-2 sm:border-b-0 flex items-center'>
                  <img className='sm:w-10 w-60 sm:h-10 h-60 ' src={p.logo} alt="" />
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.nombre_corto}
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.codigoTpf}
                </div>

                <div className='sm:col-span-2 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.nombre_completo}

                </div>

              </div>
            </Link>
          ))}



        </div>

      </div>







    </div>
  )
}

export default Home