import React from 'react';
import ImagenHome from '../assets/imagenHome3.jpg';
import { FaClipboardList, FaHardHat, FaMicroscope, FaArrowAltCircleRight } from "react-icons/fa";

function Home() {
  localStorage.setItem('idProyecto', 'i8l2VQeDIIB7fs3kUQxA');
  localStorage.setItem('proyecto', 'i8l2VQeDIIB7fs3kUQxA');
  localStorage.setItem('nombre_proyecto', 'Sector 3 - ADIF');
  localStorage.setItem('tramo', 'Mondragón-Elorrio-Bergara');
  localStorage.setItem('obra', 'Linea de alta velocidad Vitoria-Bilbao-San Sebastián');


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-[50vh] pt-20 flex items-start justify-center"
        style={{ backgroundImage: `url(${'https://images.unsplash.com/photo-1592829660583-ff09d8d232f5?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative text-center text-white px-6 flex flex-col items-center">
          <h1 className="text-6xl font-bold mb-4 underline">AP4I</h1>
          <h1 className="text-6xl font-bold mb-4 underline">Seguridad y salud</h1>
          {/* <p className="text-lg lg:text-2xl max-w-3xl mx-auto">
            Gestiona inspecciones, parte de obra y auscultación desde una sola aplicación. Simplifica tus procesos con nuestras herramientas confiables.
          </p> */}
          <p className="text-3xl max-w-3xl mx-auto">
            Seguimiento digital de plan de inspección de obra
          </p>
          <button className="xl:flex hidden text-white items-center gap-2 px-6 py-3 text-xl font-medium rounded-lg shadow-md mt-6 transition duration-300">
            <FaArrowAltCircleRight className='text-amber-600 text-xl ' />
            TPF INGENIERIA
          </button>
        </div>

      </div>

      {/* Sección de Áreas */}
      <div className="container mx-auto px-6 lg:px-20 py-6">
        <h2 className="text-2xl font-bold text-gray-600 text-center mb-6 underline">
          Áreas de Trabajo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Inspección */}
          <div className="bg-white shadow-md rounded-lg p-8 text-center flex flex-col items-center">
            <FaClipboardList className="text-sky-600 text-4xl mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Inspección</h3>
            <p className="text-gray-600 mb-4">
              Lleva el control de todas tus inspecciones de forma intuitiva y organizada.
            </p>

          </div>

          {/* Parte de Obra */}
          <div className="bg-white shadow-md rounded-lg p-8 text-center flex flex-col items-center">
            <FaHardHat className="text-sky-600 text-4xl mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Parte de Obra</h3>
            <p className="text-gray-600 mb-4">
              Gestiona tus partes de obra y lleva el registro al día.
            </p>

          </div>

          {/* Auscultación */}
          <div className="bg-white shadow-md rounded-lg p-8 text-center flex flex-col items-center">
            <FaMicroscope className="text-sky-600 text-4xl mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">Auscultación</h3>
            <p className="text-gray-600 mb-4">
              Monitorización y analisis de datos con precisión.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
