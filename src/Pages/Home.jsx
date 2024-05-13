import React, { useEffect, useState } from 'react'
import { db } from '../../firebase_config';
import { collection, getDocs, deleteDoc, query, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';

import { GoHomeFill } from "react-icons/go";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';





function Home() {
  const [proyectos, setProyectos] = useState([])
  const obtenerProyecto = (p) => {
    localStorage.setItem('nombre_proyecto', p.nombre_corto)
    localStorage.setItem('logo_proyecto', p.logo)
    localStorage.setItem('tramo', p.tramo)
    localStorage.setItem('obra', p.obra)
    localStorage.setItem('idProyecto', p.id)
  }
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
      if (user) {
          const fetchUserData = async () => {
              try {
                  const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
                  const querySnapshot = await getDocs(q);
                  if (!querySnapshot.empty) {
                      // Asumiendo que el uid es único y solo debería devolver un documento
                      const userData = querySnapshot.docs[0].data();
                      setUserRole(userData.role)
                  } else {
                      console.log("No se encontraron documentos con ese UID.");
                  }
              } catch (error) {
                  console.error("Error al obtener datos del usuario:", error);
              }
          };

          fetchUserData();
      }
  }, [user]);
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
        console.log(proyectosData[0].id)
        localStorage.setItem('proyecto', proyectosData[0].id)
       
      } catch (error) {
        console.error('Error al obtener la lista de proyectos:', error);
      }
    };

    obtenerProyectos();
  }, []);

  const suma = (a,b) => {
  return a + b
  }

  
  return (
    <div className='min-h-screen text-gray-500'>

      {/* <div className='flex gap-2 items-center justify-start bg-white px-12 py-5 rounded rounded-xl shadow-md text-base'>
        <GoHomeFill style={{ width: 20, height: 20, fill: '#d97706' }} />
        <Link to={'/'}>
          <h1 className='font-medium text-lg text-gray-500 text-amber-600'>Área inspección</h1>
        </Link>

      </div> */}



      <div className='flex gap-3 flex-col'>

        

        {proyectos.map((p, i) => (
         
            <div className="relative">
              <img src='https://maldita.es/uploads/images/2022/07/62c6f70f2549cadif-copy-jpg.jpg' alt="Sustainable Building" className="w-full  h-screen" />
              <div className="absolute inset-0 bg-black bg-opacity-45"></div>

              <div className="absolute inset-0 flex flex-col items-start justify-start md:px-20 lg:px-40 xl:px-20 2xl:px-40">

                {/* <div className=' text-white mt-10  w-[800px]  px-16 py-6 rounded-xl'>
                  <h2 className="text-xl font-bold text-white">Building the world, better</h2>
                  <p className="text-md text-gray-300 mt-2">BREEAM Excellent certified buildings</p>
                </div> */}

                <div className=' text-white bg-sky-600 bg-opacity-70 mt-20 ml-20 rounded-2xl shadow-xl  w-[700px]  px-16 py-6'>
                  <div className="text-6xl font-bold text-white mb-2"> {p.nombre_corto}</div>
                  <p className="text-2xl mt-4"> {p.obra}</p>
                  <p className="text-2xl mt-1"> {p.tramo}</p>
                  <Link to={`/elemento/${p.id}`} onClick={() => { obtenerProyecto(p) }}>
                  {(userRole === 'admin' || userRole === 'usuario') && (
                    <button
                   
                   className="text-gray-500 mt-8 flex items-center gap-3 text-lg font-semibold bg-white py-2 px-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1"
                 >
                   <span className='text-amber-500 text-xl transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                   Comenzar
                 </button>
                  )}
                  </Link>
                  
                  

                </div>
              </div>
            </div>
          
        ))}

        {/* <div class="w-full rounded rounded-xl">
          <div className='grid sm:grid-cols-8 grid-cols-1 sm:px-5 sm:py-2 sm:bg-gray-100 rounded rounded-md '>
            <div className='text-left ps-2 font-medium text-gray-600 sm:block hidden'>Logo</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Proyecto</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Tramo</div>
            <div className='sm:col-span-2 text-left ps-10 font-medium text-gray-600 sm:block hidden'>Obra</div>
          </div>



          {proyectos.map((p, i) => (
            <Link to={`/elemento/${p.id}`} onClick={() => { obtenerProyecto(p) }}
            >
              <div key={i} className='cursor-pointer grid sm:grid-cols-8 grid-cols-1 items-center justify-start sm:p-5 border-b-2'>
                <div className='sm:border-r-2 sm:border-b-0 flex items-center'>
                  <img className='sm:max-w-20 sm:max-h-12 max-w-32' src={p.logo} alt="" />
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.nombre_corto}
                </div>

                <div className='sm:col-span-2 sm:border-r-2 sm:border-b-0 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.tramo}
                </div>

                <div className='sm:col-span-2 h-10 flex items-center sm:justify-start sm:ps-10 font-medium text-gray-600'>
                  {p.obra}

                </div>

              </div>
            </Link>
          ))}



        </div> */}



      </div>







    </div>
  )
}

export default Home