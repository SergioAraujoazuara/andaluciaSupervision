import React, { useState, useEffect } from "react";
import { storage } from "../../../firebase_config";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { AiOutlineClose } from "react-icons/ai";
import { FaFilePdf, FaTrashAlt } from "react-icons/fa";
import { IoSearchCircleOutline } from "react-icons/io5";

const ListaInformesModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfList, setPdfList] = useState([]);
  const [loading, setLoading] = useState(false);
  const selectedProjectName = localStorage.getItem("selectedProjectName");

  // 🔹 Función para obtener la lista de archivos PDF en Storage
  const fetchPdfFiles = async () => {
    setLoading(true);
    try {
      const folderRef = ref(storage, "informes/"); // 📂 Carpeta de informes
      const fileList = await listAll(folderRef); // 📜 Lista de archivos

      const urls = await Promise.all(
        fileList.items.map(async (file) => {
          const downloadURL = await getDownloadURL(file);
          return { name: file.name, url: downloadURL, ref: file };
        })
      );

      // 🔹 Filtrar solo los que empiezan con `selectedProjectName`
      const pdfsFiltrados = urls.filter(item => item.name.startsWith(selectedProjectName));

      setPdfList(pdfsFiltrados); // ⬅️ Guardamos solo los filtrados
      console.log(pdfsFiltrados); // Ver en consola

    } catch (error) {
      console.error("❌ Error al obtener los PDFs:", error);
    }
    setLoading(false);
  };

  // 🔥 **Función para eliminar un archivo**
  const handleDeleteFile = async (file) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${file.name}"?`)) return;

    try {
      await deleteObject(file.ref);
      setPdfList(prevList => prevList.filter(item => item.name !== file.name));
      console.log(`✅ Archivo eliminado: ${file.name}`);
    } catch (error) {
      console.error(`❌ Error al eliminar el archivo ${file.name}:`, error);
    }
  };

  // 🔹 Abrir el modal y cargar los PDFs
  const handleOpenModal = () => {
    setModalOpen(true);
    fetchPdfFiles();
  };

  return (
    <div>
      {/* Botón para abrir el modal */}
      <button
        className="px-4 py-2 h-12 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 flex gap-2 items-center"
        onClick={handleOpenModal}
      >
       
       <span><IoSearchCircleOutline className="text-2xl"/></span>Ver Informes
      </button>

      {/* Modal con tabla de informes */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
            {/* Encabezado con botón de cerrar */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">📂 Informes Guardados</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <AiOutlineClose size={24} />
              </button>
            </div>

            <div className="border-b-2 w-full mb-4"></div>

            {loading ? (
              <p className="text-gray-500 text-center">Cargando archivos...</p>
            ) : pdfList.length === 0 ? (
              <p className="text-gray-500 text-center">No hay informes disponibles.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 shadow-md rounded-lg">
                  <thead className="bg-sky-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Nombre del Informe</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Fecha</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pdfList.map((pdf, index) => {
                      const formattedDate = pdf.name.split("_").pop().replace(".pdf", "").replace("T", " ");
                      return (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-3 text-gray-700">{pdf.name}</td>
                          <td className="px-4 py-3 text-gray-600">{formattedDate}</td>
                          <td className="px-4 py-3 flex justify-center gap-4">
                            <a
                              href={pdf.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                            >
                              Ver
                            </a>
                            <button
                              onClick={() => handleDeleteFile(pdf)}
                              className="px-3 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                              <FaTrashAlt />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaInformesModal;
