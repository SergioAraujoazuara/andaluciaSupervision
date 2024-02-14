import React, { useState } from 'react';
import logo from '../assets/logo_solo.png';
import { PiBuildingsBold } from "react-icons/pi";
import { FaCircleUser } from "react-icons/fa6";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';


import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const nombre_proyecto = localStorage.getItem('nombre_proyecto')

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState(location.pathname);



  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto px-4 sm:px-10">
        <div className="flex justify-between h-16">
          <div className="flex gap-10">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-auto"
                src={logo}
                width={60}
                alt="logo"
              />
              <span className="text-base font-bold text-gray-600 text-lg">Inspección</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                to="/"
                linkName="Inicio"
                activeLink={activeLink}
                handleLinkClick={handleLinkClick}
              />
              <NavLink
                to="/admin"
                linkName="Administración"
                activeLink={activeLink}
                handleLinkClick={handleLinkClick}
              />

            </div>
          </div>
          <div className='flex items-center font-medium text-gray-500 pr-5 gap-8 text-base'>

            <div className='flex gap-2 items-center'>
              <PiBuildingsBold />
              <p>{nombre_proyecto}</p>
            </div>

            <div className="relative">
      <button className="flex gap-2 items-center" onClick={toggleDropdown}>
        <FaCircleUser />
        <p>Sergio Araujo</p>
        {dropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md">
          {/* Aquí puedes poner el contenido del desplegable */}
          <p className="px-4 py-2 text-gray-800 hover:bg-gray-300">Perfil</p>
          <p className="px-4 py-2 text-gray-800 hover:bg-gray-300">Configuración</p>
          <p className="px-4 py-2 text-gray-800 hover:bg-gray-300">Ayuda</p>
          <p className="px-4 py-2 text-gray-800 hover:bg-gray-300">Cerrar Sesión</p>
        </div>
      )}
    </div>

          </div>



        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, linkName, activeLink, handleLinkClick }) => {
  const isActive = to === activeLink;
  const borderColorClass = isActive ? 'border-sky-600' : 'border-transparent';
  const textColorClass = isActive ? 'text-sky-600' : 'text-gray-300';

  return (
    <Link
      to={to}
      onClick={() => handleLinkClick(to)}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium ${borderColorClass} ${textColorClass}`}
    >
      {linkName}
    </Link>
  );
};

export default Navbar;
