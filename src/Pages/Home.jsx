import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { GoHomeFill } from "react-icons/go";
import { MdErrorOutline } from "react-icons/md";
import { IoFolderOpen } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";
import { Link } from 'react-router-dom';
function Home() {
  const { user, loading } = useAuth(); // Obtén el usuario y su estado de carga
  const [userProjects, setUserProjects] = useState([]); // Proyectos del usuario
  const [userName, setUserName] = useState(''); // Nombre del usuario
  const [selectedProject, setSelectedProject] = useState(localStorage.getItem('selectedProjectId') || null); // Inicializa desde localStorage
  const [projectData, setProjectData] = useState(null); // Datos del proyecto seleccionado
  const [projectLoading, setProjectLoading] = useState(false); // Estado de carga para el proyecto seleccionado
  const [role, setRole] = useState('')
  const [isSelected, setIsSelected] = useState(false);
  const selectedProjectName = localStorage.getItem("selectedProjectName");

  // Obtener los proyectos asignados al usuario
  useEffect(() => {
    if (user) {
      const fetchUserDetails = async () => {
        const db = getFirestore();
        const usersRef = collection(db, 'usuarios');

        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setUserName(data.nombre); // Guarda el nombre del usuario
          setUserProjects(data.proyectos || []); // Guarda los proyectos asignados
          setRole(data.role); // Guarda los proyectos asignados
        });
      };

      fetchUserDetails();
    }
  }, [user]);

  // Cargar datos del proyecto seleccionado al inicializar
  useEffect(() => {
    if (selectedProject) {
      handleProjectChange(selectedProject); // Carga los datos del proyecto al inicio
    }
  }, [selectedProject]);

  // Manejar la selección de un proyecto
  const handleProjectChange = async (id) => {
    setSelectedProject(id); // Establece el ID del proyecto seleccionado

    // Consulta la información del proyecto seleccionado
    setProjectLoading(true);
    const db = getFirestore();
    const projectRef = doc(db, "proyectos", id);

    try {
      const projectSnap = await getDoc(projectRef);
      if (projectSnap.exists()) {
        let infoProject = projectSnap.data();

        // Almacena la información completa del proyecto en el localStorage
        localStorage.setItem('selectedProjectId', id);
        localStorage.setItem('selectedProjectName', infoProject.obra);
        localStorage.setItem('obra', infoProject.contrato);
        localStorage.setItem('tramo', infoProject.descripcion);

        // Actualiza el estado del proyecto
        setProjectData(infoProject);

        console.log("Proyecto guardado en localStorage:", infoProject);
      } else {
        console.error("No se encontró el proyecto en la base de datos.");
        setProjectData(null);
      }
    } catch (error) {
      console.error("Error al obtener el proyecto:", error);
      setProjectData(null);
    } finally {
      setProjectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-start mt-40 min-h-screen">
        {/* Spinner animado */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Mensaje de carga */}
        <h2 className="text-lg font-semibold text-gray-700 mt-4">
          Cargando información...
        </h2>

        {/* Subtítulo con mensaje amigable */}
        <p className="text-gray-500 text-sm mt-2">
          Estamos obteniendo los datos, por favor espera un momento.
        </p>
      </div>
    )
      ; // Muestra mientras se carga la autenticación
  }

  return (
    <div className="container mx-auto xl:px-14 py-2 text-gray-500 mb-10 min-h-screen">
       <div className="flex md:flex-row flex-col gap-2 items-center justify-between px-5 py-3 text-md">
              {/* Navegación */}
              <div className="flex gap-2 items-center">
                {/* Elementos visibles solo en pantallas medianas (md) en adelante */}
                <GoHomeFill className="hidden md:block" style={{ width: 15, height: 15, fill: "#d97706" }} />
                <Link to="#" className="hidden md:block font-medium text-gray-600">
                  Home
                </Link>
                <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />
                <h1 className="hidden md:block font-medium">Ver registros</h1>
                <FaArrowRight className="hidden md:block" style={{ width: 12, height: 12, fill: "#d97706" }} />
      
                {/* Nombre del proyecto (visible en todas las pantallas) */}
                <h1 className="font-medium text-amber-600 px-2 py-1 rounded-lg">
                  {selectedProjectName}
                </h1>
              </div>
      
              {/* Botón de volver */}
              <div className="flex items-center">
              
              </div>
            </div>

            <div className="w-full border-b-2 mb-6"></div>
      {/* Hero Section */}

      {role === 'invitado' && (
        <div className="flex flex-col items-center justify-center bg-white shadow-lg border border-amber-600 rounded-lg p-6 max-w-md mx-auto mt-20 text-center">
          <MdErrorOutline className="text-amber-600 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-amber-700">Acceso Restringido</h2>
          <p className="text-gray-600 mt-2">
            Contacta al administrador para obtener un rol asignado.
            <br />
            <span className="font-medium text-amber-600">Sin un rol, no tienes acceso a la aplicación.</span>
          </p>
        </div>
      )}
      {userProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center bg-white shadow-lg border border-gray-300 rounded-lg p-8 max-w-md mx-auto mt-20 text-center">
          {/* Icono de error */}
          <MdErrorOutline className="text-gray-600 text-6xl mb-4" />

          {/* Mensaje principal */}
          <h2 className="text-2xl font-bold text-gray-600">No tienes proyectos asignados</h2>

          {/* Mensaje secundario */}
          <p className="text-gray-600 mt-2 text-sm">
            Contacta al administrador para que te asigne acceso a los proyectos y puedas continuar con tu trabajo.
          </p>


        </div>
      )}


      {(role === 'admin' || role === 'usuario') && userProjects.length > 0 && (
        <div>


          {/* Sección de Proyectos */}
          <div className=" px-6">
            <h2 className="text-lg font-semibold text-start mb-4">Selecciona un Proyecto</h2>

            <div className="relative w-full max-w-lg">
              <select
                onChange={(e) => handleProjectChange(e.target.value)}
                value={selectedProject || ""}
                className={`block w-full px-4 py-3 border rounded-lg shadow-md focus:outline-none transition-all duration-300 ease-in-out ${selectedProject ? "bg-blue-100 border-blue-500 text-blue-700 font-semibold" : "bg-white border-gray-300 "
                  }`}
              >
                <option value="" disabled>Selecciona un proyecto...</option>
                {userProjects.length > 0 ? (
                  userProjects.map((proj) => (
                    <option key={proj.id} value={proj.id} className="">
                      {selectedProject === proj.id ? `✔ ${proj.name} (Seleccionado)` : proj.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No tienes proyectos asignados</option>
                )}
              </select>
            </div>
          </div>


        </div>
      )}


      {/* Detalles del Proyecto Seleccionado */}
      {selectedProject && projectData && (role === 'admin' || role === 'usuario') && userProjects.length > 0 && (
        <div className=" px-6 py-4 text-gray-600">
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-300">

            {/* Encabezado con fondo degradado y branding */}
            <div className="relative bg-sky-700 text-white px-8 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold tracking-wide flex gap-3 items-center"><IoFolderOpen /> Proyecto Seleccionado</h3>

            </div>

            {/* Contenido del Proyecto */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">

              {/* Logotipos */}
              <div className="flex flex-col ">
                <img
                  src={projectData.logo || 'https://via.placeholder.com/150'}
                  alt="Logo del Proyecto"
                  className="w-full h-24 object-contain rounded-lg mb-4"
                />
                <img
                  src={projectData.logoCliente || 'https://via.placeholder.com/150'}
                  alt="Logo del Cliente"
                  className="w-full h-20 object-contain rounded-lg"
                />
              </div>

              {/* Información del Proyecto */}
              <div className="col-span-2 flex flex-col justify-center">
                <h2 className="text-lg font-bold">Empresa: {projectData.empresa}</h2>
                <p className=" mt-2 leading-relaxed">Promotor: {projectData.descripcion}</p>

                {/* Datos principales */}
                <div className="mt-6 ">
                  <div className="p-4">
                  <p className="text-lg"><span className='font-bold'>Obra: </span>{projectData.obra}</p>
                    <p className=" text-lg"><span className='font-bold'>Número de contrato: </span>{projectData.contrato}</p>
                    <p className=" text-lg"><span className='font-bold'>Plazo: </span> {projectData.contrato}</p>
                    <p className=" text-lg"><span className='font-bold'>Presupuesto: </span> {projectData.presupuesto}</p>
                    <p className=" text-lg"><span className='font-bold'>Coordinador de seguridad y salud: </span> {projectData.coordinador}</p>
                    <p className=" text-lg"><span className='font-bold'>Director: </span> {projectData.director}</p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
