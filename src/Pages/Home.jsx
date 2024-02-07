import React from 'react'

import logo from '../assets/logo_solo.png';
import { FaArrowRight } from "react-icons/fa";

import { GoHomeFill } from "react-icons/go";

import { Link } from 'react-router-dom';

const proyectoNombre = 'Sector 3 (ADIF)'

const obtenerProyecto = () => {
  localStorage.setItem('proyectoNombre', proyectoNombre)
}


function Home() {
  return (
    <div className='min-h-screen px-14 py-5 text-gray-500'>

      <div className='flex gap-2 items-center justify start bg-white px-5 py-4 rounded rounded-xl shadow-md'>
        <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
        <Link to={'/'}>
          <h1 className='text-base font-medium text-gray-500 text-amber-600'>Inicio</h1>
        </Link>
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
              <div  className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Contrato</div>
              <div  className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Ubicación</div>
            </div>

            <Link to={'/modulos'} onClick={obtenerProyecto}>
              <div className='cursor-pointer grid sm:grid-cols-8 grid-cols-1 items-center justify-start sm:p-5 border-b-2'>
                <div className='sm:border-r-2 sm:border-b-0 flex items-center'>
                  <img className='sm:w-20 w-60 ' src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Adif_alta_velocidad_wordmark.png" alt="" />
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {proyectoNombre}
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                6500010002000012
                </div>

                <div className='sm:col-span-2 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  Madrid, España

                </div>

              </div>
            </Link>

          </div>

        </div>





    

    </div>
  )
}

export default Home