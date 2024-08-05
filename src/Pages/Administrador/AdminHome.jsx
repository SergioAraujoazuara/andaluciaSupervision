import React, { useEffect, useState } from 'react'
import { db } from '../../../firebase_config';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { collection, getDocs, deleteDoc, query, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { IoCreateOutline } from "react-icons/io5";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdOutlineEditLocation } from "react-icons/md";
import { IoArrowBackCircle } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaCircleUser } from "react-icons/fa6";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from '../../context/authContext';


function AdminHome() {
    const { user } = useAuth();
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
                        console.log(userData.role)
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


    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate('/'); // Esto navega hacia atrás en la historia
    };
    const idProyecto = localStorage.getItem('proyecto')
    return (
        <div className='min-h-screen container mx-auto xl:px-14 py-2 text-gray-500'>

            <div className='flex gap-2 items-center justify-between bg-white px-5 py-3 rounded rounded-xl shadow-md text-base'>

                <div className='flex gap-2 items-center'>
                    <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />


                    <Link to={'#'}>
                        <h1 className='font-medium text-amber-600'>Administración</h1>
                    </Link>
                </div>


                <div className='flex items-center'>
                    <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

                </div>

            </div>


            <div>
                <div className='flex gap-3 flex-col items-start justify-center mt-5 bg-white p-4 rounded rounded-xl shadow-md'>




                    <div class="w-full rounded rounded-xl">


                        <div className='flex flex-col gap-16 items-start justify-start p-5 xl:p-10
     '>
                            {(userRole === 'invitado' && (

                                <div className=''>
                                    <p>No tienes permisos para administrador</p>
                                </div>


                            ))}

                            {(userRole === 'admin' || userRole === 'usuario') && (
                                <Link className='w-full' to={`/trazabilidad/${idProyecto}`}>
                                    <div className='flex flex-col justify-center items-center xl:flex-row gap-4  transition duration-300 ease-in-out hover:-translate-y-1  w-full'>
                                        <div className=' flex items-center text-gray-600'>
                                            <span ><IoCreateOutline className='w-[100px] h-[100px]' /></span>
                                        </div>
                                        <div className='sm:col-span-9 text-center xl:text-start flex flex-col justify-center items-center xl:items-start sm:justify-center text-base font-medium'>
                                            <p className='flex items-center gap-2'>
                                                <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight />
                                                </span>Administrar proyecto
                                            </p>
                                            <p className='mt-4 font-normal'>Creación y configuración del proyecto,
                                                agregar la trazabilidad completa del proyecto, establecer parámetros como el sector, sub sector, parte, elemento, lote y asignar PPI
                                                Puedes agregar los datos en 2 visualizaciones distintas:
                                                <br />
                                                - Versión web
                                                <br />
                                                - Versión BIM
                                            </p>

                                        </div>
                                    </div>

                                </Link>
                            )}




                            {userRole === 'admin' && (
                                <Link className=' w-full' to={'/verPpis'}>
                                    <div className='flex flex-col xl:flex-row xl:text-start text-center gap-4 items-center transition duration-300 ease-in-out hover:-translate-y-1  w-full'>
                                        <div className='flex items-center justify-center text-gray-600'>
                                            <span ><MdOutlineEditLocation className='w-[100px] h-[100px]' /></span>
                                        </div>
                                        <div className='sm:col-span-9 xl:text-start text-center flex flex-col justify-center xl:items-start items-center sm:justify-center text-base font-medium'>
                                            <p className='flex items-center gap-2'>  <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>Plantillas PPI</p>
                                            <p className='mt-4 font-normal'>Creación y edición de plantillas de puntos de inspección (PPI).

                                            </p>

                                        </div>
                                    </div>

                                </Link>
                            )}

                            {
                                userRole === 'admin' && (
                                    <Link className=' w-full' to={'/roles'}>
                                        <div className='flex flex-col xl:flex-row gap-4 items-center transition duration-300 ease-in-out  hover:-translate-y-1'>
                                            <div className=' flex items-center text-gray-600'>
                                                <span ><FaRegUserCircle className='w-[100px] h-[100px]' /></span>
                                            </div>
                                            <div className='sm:col-span-9 flex flex-col justify-center xl:items-start items-center text-center xl:text-start sm:justify-center text-base font-medium'>
                                                <p className='flex items-center gap-2'>  <span className='text-amber-500 text-md transition duration-300 ease-in-out hover:translate-x-1 shadow-xl'><FaArrowAltCircleRight /></span>Roles de usuarios</p>
                                                <p className='mt-4 font-normal'>Asignar y editar roles a los usuarios registrados del proyecto:

                                                </p>

                                            </div>
                                        </div>

                                    </Link>
                                )
                            }






                        </div>


                    </div>

                </div>





            </div>

        </div>
    )
}

export default AdminHome