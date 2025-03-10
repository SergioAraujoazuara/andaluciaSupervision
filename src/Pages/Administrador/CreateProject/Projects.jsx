import React, { useState } from "react";
import useProjects from "../../../Hooks/useProjects"; // Usamos el hook useProjects
import useAddProject from "../../../Hooks/useAddProject"; // Importamos el hook useAddProject
import useUpdateProject from "../../../Hooks/useUpdateProject"; // Importamos el hook useUpdateProject
import useDeleteProject from "../../../Hooks/useDeleteProject"; // Importamos el hook useDeleteProject
import { db, storage } from "../../../../firebase_config";
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from "firebase/firestore";
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
  const [logo, setLogo] = useState(null);
  const [clientLogo, setClientLogo] = useState(null);

  const [existingLogoURL, setExistingLogoURL] = useState("");
  const [existingClientLogoURL, setExistingClientLogoURL] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);

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
    setLogo(null);
    setClientLogo(null);
    setSelectedProject(proj);
    setExistingLogoURL(proj.logo);
    setExistingClientLogoURL(proj.logoCliente);
  };

  // Handle updating the project
  const handleUpdateProject = async () => {
    const result = await updateProject(selectedProject.id, empresa, work, descripcion, contract, logo, clientLogo, promotor);
    showModal(result, "success");
    setIsEditing(false);
    refreshProjects(); // Refresh the project list
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
      const result = await addProject(empresa, work, descripcion, contract, logo, clientLogo, promotor);
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
          logo={logo}
          setLogo={setLogo}
          clientLogo={clientLogo}
          setClientLogo={setClientLogo}
          onSave={handleUpdateProject}
          existingLogoURL={existingLogoURL}
          existingClientLogoURL={existingClientLogoURL}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
}

export default Projects;
