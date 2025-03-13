import React, { useState } from "react";
import useProjects from "../../../Hooks/useProjects"; // Usamos el hook useProjects
import useAddProject from "../../../Hooks/useAddProject"; // Importamos el hook useAddProject
import useUpdateProject from "../../../Hooks/useUpdateProject"; // Importamos el hook useUpdateProject
import useDeleteProject from "../../../Hooks/useDeleteProject"; // Importamos el hook useDeleteProject
import { db, storage } from "../../../../firebase_config";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from "./Modal";
import AddProjectForm from "./AddProjectForm";
import EditProjectForm from "./EditProjectForm";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { FaArrowRight } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";

function Projects() {
  const { projects, loading, refreshProjects } = useProjects(); // Usamos el hook useProjects
  const { addProject, loading: addingLoading, error: addProjectError } = useAddProject(); // Usamos el hook useAddProject
  const { updateProject, loading: updatingLoading, error: updateProjectError } = useUpdateProject(); // Usamos el hook useUpdateProject
  const { deleteProject, loading: deletingLoading, error: deleteProjectError } = useDeleteProject(); // Usamos el hook useDeleteProject
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("success");

  // Fields for project data
  const [empresa, setEmpresa] = useState("TPF INGENIERÍA");
  const [work, setWork] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [promotor, setPromotor] = useState("");
  const [contract, setContract] = useState("");
  const [plazo, setPlazo] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [coordinador, setCoordinador] = useState("");
  const [director, setDirector] = useState("");
  const [logo, setLogo] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);

  const [existingLogoURL, setExistingLogoURL] = useState("");
  const [existingClientLogoURL, setExistingClientLogoURL] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectIdToEdit, setProjectIdToEdit] = useState('')

  // Function to show success/error modal
  const showModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  // Function to handle modal close and reset form
  const closeModal = () => {
    setIsAdding(false); // Hide the modal
    setEmpresa(""); // Reset form fields
    setWork("");
    setDescripcion("");
    setPromotor("")
    setContract("");
    setCoordinador("");
    setDirector("");
    setLogo(null);
    setClientLogo(null);
  };

   

  // Open the edit modal with selected project data
  const openEditModal = (proj) => {
    setIsEditing(true);
    setEmpresa(proj.empresa);
    setWork(proj.obra);
    setDescripcion(proj.descripcion);
    setPromotor(proj.promotor);
    setContract(proj.contrato);
    setPlazo(proj.plazo);
    setPresupuesto(proj.presupuesto);
    setCoordinador(proj.director);
    setDirector(proj.coordinador);
    setLogo(null);
    setClientLogo(null);
    setSelectedProject(proj);
    setExistingLogoURL(proj.logo);
    setExistingClientLogoURL(proj.logoCliente);
    setProjectIdToEdit(proj.id)
  };

  // Handle updating the project
  const handleUpdateProject = async () => {
    try {
        const updatedProjectData = {
            empresa,
            obra: work,
            descripcion,
            promotor,
            contrato: contract,
            plazo, plazo,
            presupuesto: presupuesto,
            director: director,
            coordinador: coordinador
        };

        // 1️⃣ Actualizar proyecto en Firestore
        const result = await updateProject(selectedProject.id, empresa, work, descripcion, contract, logo, clientLogo, promotor, plazo, presupuesto, coordinador, director);
        
        // 2️⃣ Actualizar el proyecto en los usuarios que lo tienen asignado
        await updateUsersWithProject(selectedProject.id, updatedProjectData);

        // 3️⃣ Mostrar mensaje de éxito
        showModal(result, "success");

        // 4️⃣ Cerrar modal de edición y refrescar la lista de proyectos
        setIsEditing(false);
        refreshProjects(); 
    } catch (error) {
        showModal("Error actualizando el proyecto: " + error.message, "error");
    }
};


  // Handle deleting the project
  const handleDeleteProject = async (id) => {
    const result = await deleteProject(id);
    showModal(result, "success");
    refreshProjects(); // Refresh the project list
  };

  // Validate fields before adding a new project
  const validateFields = (empresa, work, contract) => {
    if (!empresa && !work && !contract) {
      return "Por favor, completa al menos un campo antes de agregar el proyecto.";
    }
    return null;
  };

  const addNewProject = async () => {
    // Validación: Verificar campos vacíos
    const validationError = validateFields(empresa, work, contract);
    if (validationError) {
      showModal(validationError, "error");
      return; // Detener la ejecución si hay un error de validación
    }

    try {
      const result = await addProject(empresa, work, descripcion, contract, logo, clientLogo, promotor, plazo, presupuesto, coordinador, director);
      showModal(result, "success");
      setIsAdding(false); // Close modal after adding project
      refreshProjects(); // Refresh the project list
    } catch (error) {
      showModal(error.message, "error");
    }
  };

  // Navigate back to previous page
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate(-1);
  };



  console.log(projectIdToEdit)

  // Función para obtener los usuarios con el proyecto asignado
  const fetchUsersWithProject = async () => {
    const usersRef = collection(db, "usuarios");

    try {
      const querySnapshot = await getDocs(usersRef);
      const users = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(user =>
          user.proyectos?.some(proj => proj.id === projectIdToEdit) // Filtramos los que tienen el proyecto
        );
      console.log(users)
      return users;
    } catch (error) {
      console.error("Error obteniendo los usuarios con el proyecto asignado:", error);
      return [];
    }
  };


  fetchUsersWithProject()




  const updateUsersWithProject = async (projectId, updatedProjectData) => {
      try {
          const users = await fetchUsersWithProject(projectId); // Obtenemos los usuarios con el proyecto asignado
  
          const batch = writeBatch(db); // Creamos una batch para optimizar la actualización
  
          users.forEach((user) => {
              const userRef = doc(db, "usuarios", user.id); // Referencia al documento del usuario
  
              // Mapeamos el array de proyectos del usuario y actualizamos solo el name (obra)
              const updatedProjects = user.proyectos.map(proj =>
                  proj.id === projectId ? { ...proj, name: updatedProjectData.obra } : proj
              );
  
              batch.update(userRef, { proyectos: updatedProjects }); // Agregamos la actualización a la batch
          });
  
          await batch.commit(); // Ejecutamos todas las actualizaciones de una vez
  
          console.log("Usuarios actualizados correctamente con el nuevo name.");
      } catch (error) {
          console.error("Error actualizando los usuarios:", error);
      }
  };
  
  
  

  return (
    <div className="container mx-auto p-8 min-h-screen text-gray-500">
      <div className="flex flex-col md:flex-row gap-2 items-center justify-between px-4 py-3 text-base">
        <div className="flex gap-2 items-center flex-wrap justify-center md:justify-start">
          <GoHomeFill style={{ width: 15, height: 15, fill: "#d97706" }} />
          <Link to={"/admin"}>
            <h1 className="text-sm md:text-base">Administración</h1>
          </Link>
          <FaArrowRight style={{ width: 12, height: 12, fill: "#d97706" }} />
          <Link to={"#"}>
            <h1 className="text-sm md:text-base text-amber-600 font-medium">Información de proyectos</h1>
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-4 md:mt-0 justify-center md:justify-end w-full md:w-auto">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded text-sm md:text-base"
          >
            Agregar Proyecto
          </button>
          <button className="text-amber-600 text-3xl">
            <IoArrowBackCircle onClick={handleGoBack} />
          </button>
        </div>
      </div>

      {modalVisible && <Modal message={modalMessage} type={modalType} onClose={() => setModalVisible(false)} />}

      {/* Render the list of projects */}
      {loading ? (
        <p>Cargando proyectos...</p>
      ) : (
        <div className="overflow-x-auto ">
          <h2 className="text-lg font-bold mb-4 mt-4 ps-4">Proyectos</h2>
          <div className="border-b-2 mb-6"></div>
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">Empresa</th>
                <th className="px-4 py-2">Obra</th>
                <th className="px-4 py-2">Número de contrato</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <tr key={proj.id} className="border-b">
                  <td className="px-4 py-6">{proj.empresa}</td>
                  <td className="px-4 py-6">{proj.obra}</td>
                  <td className="px-4 py-6">{proj.contrato}</td>
                  <td className="px-4 py-6 flex gap-2">
                    <button
                      onClick={() => openEditModal(proj)}
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Project Form */}
      {isAdding && (
        <AddProjectForm
          empresa={empresa}
          setEmpresa={setEmpresa}
          work={work}
          setWork={setWork}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          promotor={promotor}
          setPromotor={setPromotor}
          contract={contract}
          setContract={setContract}
          plazo={plazo}
          setPlazo={setPlazo}
          presupuesto={presupuesto}
          setPresupuesto={setPresupuesto}
          coordinador={coordinador}
          director={director}
          setCoordinador={setCoordinador}
          setDirector={setDirector}
          logo={logo}
          setLogo={setLogo}
          clientLogo={clientLogo}
          setClientLogo={setClientLogo}
          onSave={addNewProject}
          onClose={closeModal}
        />
      )}

      {/* Edit Project Form */}
      {isEditing && (
        <EditProjectForm
          empresa={empresa}
          setEmpresa={setEmpresa}
          work={work}
          setWork={setWork}
          descripcion={descripcion}
          setDescripcion={setDescripcion}
          promotor={promotor}
          setPromotor={setPromotor}
          contract={contract}
          setContract={setContract}
          plazo={plazo}
          setPlazo={setPlazo}
          presupuesto={presupuesto}
          setPresupuesto={setPresupuesto}
          coordinador={coordinador}
          director={director}
          setCoordinador={setCoordinador}
          setDirector={setDirector}
          logo={logo}
          setLogo={setLogo}
          clientLogo={clientLogo}
          setClientLogo={setClientLogo}
          onSave={handleUpdateProject}
          existingLogoURL={existingLogoURL}
          existingClientLogoURL={existingClientLogoURL}
          setIsEditing={setIsEditing}
          projectIdToEdit={projectIdToEdit}
        />
      )}
    </div>
  );
}

export default Projects;
