import React, { useState } from "react";
import GestionOpciones from "./GestionCampos";
import GestionPlantillas from "./GestionPlantillas";
import { Link, useNavigate } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { IoArrowBackCircle } from "react-icons/io5";
import { FaArrowRight } from "react-icons/fa";
import { AiOutlineDatabase } from "react-icons/ai";
import { SiGoogledatastudio } from "react-icons/si";


const SistemaDePestanas = () => {
  const [pestanaActiva, setPestanaActiva] = useState("campos");
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/'); // Esto navega hacia atrás en la historia
  };
  const idProyecto = localStorage.getItem('proyecto')

  return (
    <div className='min-h-screen container mx-auto xl:px-14 py-2 text-gray-500'>

      <div className='flex gap-2 items-center justify-between px-5 py-3 text-md'>

        <div className='flex gap-2 items-center'>
          <GoHomeFill style={{ width: 15, height: 15, fill: '#d97706' }} />


          <Link to={'#'}>
            <h1 className='font-medium text-amber-600'>Administración</h1>
          </Link>
          <FaArrowRight style={{ width: 12, height: 12, fill: '#d97706' }} />
          <p className='font-medium text-gray-500'>Formularios</p>
        </div>


        <div className='flex items-center'>
          <button className='text-amber-600 text-3xl' onClick={handleGoBack}><IoArrowBackCircle /></button>

        </div>

      </div>

      <div className="w-full border-b-2"></div>

      {/* Barra de pestañas */}
      <div className="flex justify-center gap-4 mt-5">
        <button
          onClick={() => setPestanaActiva("campos")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow ${pestanaActiva === "campos"
              ? "bg-sky-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
          <SiGoogledatastudio />
          Campos
        </button>
        <button
          onClick={() => setPestanaActiva("plantillas")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow ${pestanaActiva === "plantillas"
              ? "bg-sky-600 text-white shadow-lg"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
        >
          <AiOutlineDatabase />
          Plantillas
        </button>
      </div>


      {/* Contenido dinámico según la pestaña seleccionada */}
      <div>
        {pestanaActiva === "campos" && <GestionOpciones />}
        {pestanaActiva === "plantillas" && <GestionPlantillas />}
      </div>
    </div>
  );
};

export default SistemaDePestanas;
