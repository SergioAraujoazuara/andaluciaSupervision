import React from "react";
import { AiOutlineForm, AiOutlineTable } from "react-icons/ai";
import { IoArrowBackCircle } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { Link, useNavigate } from "react-router-dom";
/**
 * GridParteDeObra Component
 * 
 * This component renders a navigation grid for a construction project system.
 * It includes links to different sections such as "Formularios" and "Ver Registros."
 */

const GridParteDeObra = () => {
    /**
   * Navigates back in the browser history.
   */
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="min-h-screen container mx-auto xl:px-14 py-2 text-gray-500 mb-10">
      {/* header */}
      <div className="flex gap-2 items-center justify-between px-5 py-3 text-md">
        {/* Navigate */}
              <div className="flex gap-2 items-center">
                  <GoHomeFill style={{ width: 15, height: 15, fill: "#d97706" }} />
                  <Link to="#">
                      <h1 className="font-medium text-amber-600">Administración</h1>
                  </Link>
              </div>

        {/* Back */}
        <div className="flex items-center">
          <button className="text-amber-600 text-3xl" onClick={handleGoBack}>
            <IoArrowBackCircle />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl p-6 mt-12">
        {/* Card */}
        <Link to="/formularios">
          <div className="group relative bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gray-100 group-hover:bg-blue-50 transition-colors duration-300"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-gray-800 p-8">
              <AiOutlineForm className="text-6xl text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold">Formulario</h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Registro diario de obras de supervisión
              </p>
            </div>
          </div>
        </Link>

        {/* Card register */}
        <Link to="/ver-registros">
          <div className="group relative bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gray-100 group-hover:bg-green-50 transition-colors duration-300"></div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-gray-800 p-8">
              <AiOutlineTable className="text-6xl text-green-600 mb-4" />
              <h2 className="text-2xl font-semibold">Ver Registros</h2>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Consulta y administra los registros fácilmente.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default GridParteDeObra;
