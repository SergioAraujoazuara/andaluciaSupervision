import React, { useState, useEffect } from "react";
import { db, storage } from "../../../firebase_config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteObject } from "firebase/storage";

import { Link } from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { FaEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { IoCloseCircle } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { IoArrowBackCircle } from "react-icons/io5";
import { IoAlertCircleSharp } from "react-icons/io5";

function Projects() {
  const navigate = useNavigate();
  const handleGoBack = () => {
      navigate('/admin'); // Esto navega hacia atrás en la historia
  };
  const [nombre, setNombre] = useState("");
  const [obra, setObra] = useState("");
  const [tramo, setTramo] = useState("");
  const [contrato, setContrato] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoCliente, setLogoCliente] = useState(null);  // Solo un logo de cliente
  const [proyectosSupervision, setProyectosSupervision] = useState([]);
  const [proyectoInspeccion, setProyectoInspeccion] = useState(null);

  // Estados para los modales
  const [isEditing, setIsEditing] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Obtener todos los proyectos
  const fetchProyectos = async () => {
    const proyectosCollection = collection(db, "proyectos");
    const proyectosSnapshot = await getDocs(proyectosCollection);

    const supervision = [];
    let inspeccion = null;

    proyectosSnapshot.docs.forEach((doc) => {
      const proyecto = { id: doc.id, ...doc.data() };
      if (proyecto.nombre_corto) {
        inspeccion = proyecto; // Proyecto de inspección
      } else {
        supervision.push(proyecto); // Proyectos de supervisión
      }
    });

    setProyectosSupervision(supervision);
    setProyectoInspeccion(inspeccion);
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  // Función para guardar un nuevo proyecto de supervisión
  const guardarProyectoSupervision = async () => {
    if (!nombre || !obra || !contrato || !logo) {
      alert("Por favor, completa todos los campos y sube los archivos necesarios.");
      return;
    }

    try {
      const logoRef = ref(storage, `logos/${logo.name}`);
      await uploadBytes(logoRef, logo);
      const logoURL = await getDownloadURL(logoRef);

      let logoClienteURL = null;
      if (logoCliente) {
        const logoClienteRef = ref(storage, `logos_clientes/${logoCliente.name}`);
        await uploadBytes(logoClienteRef, logoCliente);
        logoClienteURL = await getDownloadURL(logoClienteRef);
      }


      await addDoc(collection(db, "proyectos"), {
        nombre,
        obra,
        contrato,
        tramo,
        logo: logoURL,
        logoCliente: logoClienteURL,  // Ahora es solo una URL de un solo logo de cliente
      });


      setSuccessMessage("Proyecto de supervisión guardado correctamente.");
      setShowSuccessModal(true);
      fetchProyectos();

      setNombre("");
      setObra("");
      setTramo("");
      setContrato("");
      setLogo(null);
      setLogoCliente(null);
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
    }
  };

  // Función para abrir modal de edición
  const startEditing = (proyecto) => {
    setIsEditing(true);
    setEditProject({
      ...proyecto,
      newLogo: null,
      newLogoCliente: null, // Solo un logo de cliente
    });

  };

  // Función para actualizar proyecto


  const actualizarProyecto = async () => {
    if (!editProject.nombre || !editProject.obra || !editProject.contrato) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const projectRef = doc(db, "proyectos", editProject.id);

      // 1. Eliminar logo anterior si se ha cambiado
      let updatedLogoURL = editProject.logo;
      if (editProject.newLogo) {
        // Eliminar el logo anterior
        if (editProject.logo) {
          const oldLogoRef = ref(storage, editProject.logo.split("?")[0]);
          await deleteObject(oldLogoRef);
        }
        // Subir el nuevo logo
        const logoRef = ref(storage, `logos/${editProject.newLogo.name}`);
        await uploadBytes(logoRef, editProject.newLogo);
        updatedLogoURL = await getDownloadURL(logoRef);
      }

      // 2. Eliminar logos de clientes anteriores si se han cambiado
      let updatedLogoClienteURL = editProject.logoCliente || null;
      if (editProject.newLogoCliente) {
        // Eliminar el logo de cliente anterior si existe
        if (editProject.logoCliente) {
          const oldClienteLogoRef = ref(storage, editProject.logoCliente.split("?")[0]);
          await deleteObject(oldClienteLogoRef);
        }

        // Subir el nuevo logo de cliente
        const logoClienteRef = ref(storage, `logos_clientes/${editProject.newLogoCliente.name}`);
        await uploadBytes(logoClienteRef, editProject.newLogoCliente);
        updatedLogoClienteURL = await getDownloadURL(logoClienteRef);
      }


      // 3. Actualizar Firestore con los nuevos datos
      await updateDoc(projectRef, {
        nombre: editProject.nombre,
        obra: editProject.obra,
        contrato: editProject.contrato,
        tramo: editProject.tramo,
        logo: updatedLogoURL,
        logoCliente: updatedLogoClienteURL,
      });

      setIsEditing(false);
      setSuccessMessage("Proyecto actualizado correctamente.");
      setShowSuccessModal(true);
      fetchProyectos();
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
    }
  };



  // Función para eliminar proyecto
  const deleteProject = async () => {
    try {
      await deleteDoc(doc(db, "proyectos", deleteProjectId));
      setShowDeleteModal(false);
      setSuccessMessage("Proyecto eliminado correctamente.");
      setShowSuccessModal(true);
      fetchProyectos();
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
    }
  };

  return (
    <div className='container mx-auto min-h-screen xl:px-14 py-2 text-gray-500'>
      <div className='flex gap-2 items-center justify-between px-4 py-3 text-base'>

        <div className='flex gap-2 items-center'>
          <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />
          <Link to={'/admin'}>
            <h1 className='text-gray-500 text-gray-500'>Administración</h1>
          </Link>
          <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
          <Link to={'#'}>
            <h1 className='text-amber-500 font-medium'>Información de proyectos</h1>
          </Link>
        </div>



        <div className='flex items-center'>
          <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

        </div>

      </div>

      <div className="w-full border-b-2 pb-1"></div>
     

      {/* Formulario para agregar proyectos de supervisión */}
      <div className="bg-white p-8 rounded-xl shadow-xl space-y-4">
        <h2 className="text-lg font-bold">Nuevo Proyecto de Supervisión</h2>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del Proyecto"
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          value={obra}
          onChange={(e) => setObra(e.target.value)}
          placeholder="Obra"
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          value={tramo}
          onChange={(e) => setTramo(e.target.value)}
          placeholder="Tramo"
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="text"
          value={contrato}
          onChange={(e) => setContrato(e.target.value)}
          placeholder="Contrato"
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="file"
          onChange={(e) => setLogo(e.target.files[0])}
          className="w-full px-4 py-2 border rounded-md"
        />
        <input
          type="file"
          onChange={(e) => setLogoCliente(e.target.files[0])}  // Solo un archivo
          className="w-full px-4 py-2 border rounded-md"
        />


        <button
          onClick={guardarProyectoSupervision}
          className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
        >
          Guardar Proyecto de Supervisión
        </button>
      </div>

      {/* Tabla de proyectos de supervisión */}
      <div className="mt-10 bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-5">Proyecto de Supervisión</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2">Nombre</th>
              <th className="p-2">Obra</th>
              <th className="p-2">Tramo</th>
              <th className="p-2">Contrato</th>
              <th className="p-2">Logo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proyectosSupervision.map((proyecto, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{proyecto.nombre}</td>
                <td className="p-2">{proyecto.obra}</td>
                <td className="p-2">{proyecto.tramo}</td>
                <td className="p-2">{proyecto.contrato}</td>
                <td className="p-2">
                  <img src={proyecto.logo} alt="Logo" className="w-12 h-12" />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => startEditing(proyecto)}
                    className="text-blue-500"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setDeleteProjectId(proyecto.id);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 ml-4"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de proyecto de inspección */}
      {proyectoInspeccion && (
        <div className="mt-10 bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-5">Proyecto de Inspección</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Nombre Corto</th>
                <th className="p-2">Obra</th>
                <th className="p-2">Tramo</th>
                <th className="p-2">Logo</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">{proyectoInspeccion.nombre_corto}</td>
                <td className="p-2">{proyectoInspeccion.obra}</td>
                <td className="p-2">{proyectoInspeccion.tramo}</td>
                <td className="p-2">
                  <img
                    src={proyectoInspeccion.logoBase64}
                    alt="Logo"
                    className="w-12 h-12"
                  />
                </td>
                <td className="p-2">
                  <button
                    onClick={() => startEditing(proyectoInspeccion)}
                    className="text-blue-500"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {isEditing && (
        <div className="fixed inset-0 z-10 flex justify-center items-center bg-black bg-opacity-50">
          <div
            className="bg-white p-8 rounded-lg w-full max-w-lg overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-xl font-bold mb-4">Editar Proyecto</h2>

            {/* Campos de texto */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Nombre</label>
              <input
                type="text"
                value={editProject.nombre}
                onChange={(e) =>
                  setEditProject({ ...editProject, nombre: e.target.value })
                }
                placeholder="Nombre"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Obra</label>
              <input
                type="text"
                value={editProject.obra}
                onChange={(e) =>
                  setEditProject({ ...editProject, obra: e.target.value })
                }
                placeholder="Obra"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Tramo</label>
              <input
                type="text"
                value={editProject.tramo}
                onChange={(e) =>
                  setEditProject({ ...editProject, tramo: e.target.value })
                }
                placeholder="Tramo"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Contrato</label>
              <input
                type="text"
                value={editProject.contrato}
                onChange={(e) =>
                  setEditProject({ ...editProject, contrato: e.target.value })
                }
                placeholder="Contrato"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Mostrar logo actual */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Logo Principal (Actual)
              </label>
              <img
                src={editProject.logo}
                alt="Logo Actual"
                className="w-32 h-32 mb-4"
              />
              <input
                type="file"
                onChange={(e) =>
                  setEditProject({ ...editProject, newLogo: e.target.files[0] })
                }
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>

            {/* Mostrar logo de cliente actual */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Logo de Cliente (Actual)
              </label>
              {editProject.logoCliente && (
                <img
                  src={editProject.logoCliente}
                  alt="Logo Cliente Actual"
                  className="w-20 h-20 object-cover rounded-md mb-4"
                />
              )}
              <input
                type="file"
                onChange={(e) =>
                  setEditProject({
                    ...editProject,
                    newLogoCliente: e.target.files[0],
                  })
                }
                className="w-full px-4 py-2 border rounded-md mt-4"
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4">
              <button
                onClick={actualizarProyecto}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}




      {showDeleteModal && (
        <div className="fixed inset-0 z-10 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg">
            <p>¿Estás seguro de que deseas eliminar este proyecto?</p>
            <div className="flex justify-center mt-4">
              <button
                onClick={deleteProject}
                className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Eliminar
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-10 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg text-center">
            <p>{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
