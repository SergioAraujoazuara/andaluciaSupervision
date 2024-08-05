import React, { useEffect, useState } from 'react'
import { db } from '../../firebase_config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ImagenHome from '../assets/imagenHome.jpg'
import { FaArrowAltCircleRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Home() {
  const [proyectos, setProyectos] = useState([]);
  const { user } = useAuth();
  const [userRole, setUserRole] = useState('');

  const obtenerProyecto = (p) => {
    localStorage.setItem('nombre_proyecto', p.nombre_corto);
    localStorage.setItem('logo_proyecto', p.logo);
    localStorage.setItem('tramo', p.tramo);
    localStorage.setItem('obra', p.obra);
    localStorage.setItem('idProyecto', p.id);
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/users');
        if (response.ok) {
          const users = await response.json();
          console.log(users);
        } else {
          console.log(`Failed to fetch users: ${response.statusText}`);
        }
      } catch (error) {
        console.log(`Failed to fetch users: ${error.message}`);
      }
    };
    getUsers();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserRole(userData.role);
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

  useEffect(() => {
    const obtenerProyectos = async () => {
      try {
        const proyectosCollection = collection(db, 'proyectos');
        const proyectosSnapshot = await getDocs(proyectosCollection);

        const proyectosData = proyectosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProyectos(proyectosData);
        console.log(proyectosData[0].id);
        localStorage.setItem('proyecto', proyectosData[0].id);
      } catch (error) {
        console.error('Error al obtener la lista de proyectos:', error);
      }
    };

    obtenerProyectos();
  }, []);

  return (
    <div className='min-h-screen text-gray-500'>
      <div className='flex flex-col gap-3'>
        {proyectos.map((p) => (
          <div className="relative" key={p.id}>
            <img src={ImagenHome} alt="Sustainable Building" className="w-full h-screen object-cover object-center md:object-top lg:object-center" />
            <div className="absolute inset-0 bg-black bg-opacity-45"></div>
            <div className="absolute inset-0 flex flex-col items-start justify-start ">
              <div className='text-white bg-sky-600 bg-opacity-70 mt-20 mx-8  xl:mx-40 xl:my-20 rounded-2xl shadow-xl w-full w-[288px]  xl:w-[700px] px-12 py-8'>
                <div className="text-3xl md:text-6xl font-bold text-white mb-2">{p.nombre_corto}</div>
                <p className="text-lg md:text-2xl mt-4">{p.obra}</p>
                <p className="text-lg md:text-2xl mt-1">{p.tramo}</p>
                <Link to={`/elemento/${p.id}`} onClick={() => { obtenerProyecto(p) }}>
                  {(userRole === 'admin' || userRole === 'usuario') && (
                    <button className="text-gray-500 mt-8 flex items-center gap-3 text-lg font-semibold bg-white py-2 px-6 rounded-xl shadow-md transition duration-300 ease-in-out hover:bg-gray-100 hover:shadow-lg hover:-translate-y-1">
                      <span className='text-amber-500 text-xl transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>
                      Comenzar
                    </button>
                  )}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
