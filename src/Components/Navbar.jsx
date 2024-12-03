import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDoc, doc } from 'firebase/firestore';
import Imagen from '../assets/tpf_marca.png'; // Asegúrate de que la ruta de la imagen está correcta
import { db } from '../../firebase_config';

import { FaUserAlt, FaDoorOpen, FaBars, FaCaretDown } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const proyecto = 'i8l2VQeDIIB7fs3kUQxA';
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userRol, setUserRol] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // Menú móvil
  const [dropdownOpen, setDropdownOpen] = useState(false); // Parte de obra
  const [dropdownInspectionOpen, setDropdownInspectionOpen] = useState(false); // Inspección
  const [dropdownAuscultationOpen, setDropdownAuscultationOpen] = useState(false); // Auscultación

  // Referencias para detectar clics fuera de los menús
  const dropdownRef = useRef(null);
  const inspectionRef = useRef(null);
  const auscultationRef = useRef(null);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'usuarios', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserNombre(userData.nombre);
          setUserRol(userData.role);
        }
      });
    } else {
      setUserNombre('');
      setUserRol('');
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/authTabs');
    setShowLogoutConfirmation(false);
  };

  const toggleLogoutConfirmation = () => setShowLogoutConfirmation(!showLogoutConfirmation);

  const closeAllDropdowns = () => {
    setDropdownOpen(false);
    setDropdownInspectionOpen(false);
    setDropdownAuscultationOpen(false);
  };

  const handleDropdownClick = (dropdownSetter, currentState) => {
    // Si el menú ya está abierto, lo cerramos directamente.
    if (currentState) {
        closeAllDropdowns();
    } else {
        // Si no está abierto, cerramos todos los menús y luego abrimos el seleccionado.
        closeAllDropdowns();
        dropdownSetter(true);
    }
};


  const handleLinkClick = () => {
    closeAllDropdowns(); // Cierra todos los menús al hacer clic en cualquier enlace
  };

  const handleClickOutside = (event) => {
    if (
      dropdownRef.current && !dropdownRef.current.contains(event.target) &&
      inspectionRef.current && !inspectionRef.current.contains(event.target) &&
      auscultationRef.current && !auscultationRef.current.contains(event.target)
    ) {
      closeAllDropdowns();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    closeAllDropdowns();
  };

  return (
    <nav className="bg-gray-100 shadow">
      <div className="container mx-auto ps-0 pr-4 xl:px-10">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-auto" src={Imagen} width={150} alt="logo" />
            </div>

            {/* Menú principal */}
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/" linkName="Home" onClick={handleLinkClick} />

                {/* Inspección */}
                {(userRol === 'usuario' || userRol === 'admin') && (
                  <div className="relative" ref={inspectionRef}>
                    <button
                      onClick={() => handleDropdownClick(setDropdownInspectionOpen)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-md font-medium text-gray-500 hover:text-sky-600"
                    >
                      Inspección <FaCaretDown />
                    </button>
                    {dropdownInspectionOpen && (
                      <div className="absolute bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-50">
                        <Link
                          to={`/elemento/${proyecto}`}
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Iniciar Inspección
                        </Link>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/visor_inspeccion"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          BIM
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Parte de obra */}
                {(userRol === 'usuario' || userRol === 'admin') && (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => handleDropdownClick(setDropdownOpen)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-md font-medium text-gray-500 hover:text-sky-600"
                    >
                      Parte de obra <FaCaretDown />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-50">
                        <Link
                          to="/formularios"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Formulario
                        </Link>
                        <Link
                          to="/verRegistros"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Registros
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Auscultación */}
                {(userRol === 'usuario' || userRol === 'admin') && (
                  <div className="relative" ref={auscultationRef}>
                    <button
                      onClick={() => handleDropdownClick(setDropdownAuscultationOpen)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-md font-medium text-gray-500 hover:text-sky-600"
                    >
                      Auscultación <FaCaretDown />
                    </button>
                    {dropdownAuscultationOpen && (
                      <div className="absolute bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-50">
                        <Link
                          to="/auscultacion/llacuna"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Llacuna
                        </Link>
                        <Link
                          to="/auscultacion/glorias"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Glorias
                        </Link>
                        <Link
                          to="/auscultacion/horta"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={handleLinkClick}
                        >
                          Horta
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Administración */}
                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink to="/admin" linkName="Administración" onClick={handleLinkClick} />
                )}
              </div>
            )}
          </div>

          {/* Botón de usuario */}
          <div className="flex items-center">
            {user ? (
              <>
                <div className="hidden sm:flex items-center font-medium text-gray-500 pr-5 gap-5 text-base">
                  <div className="flex gap-2 items-center text-gray-500">
                    <FaUserAlt className="hidden xl:block" />
                    <p className="hidden xl:block">{userNombre || 'Usuario'}</p>
                  </div>
                  <div className="relative bg-sky-600 text-white px-4 py-2 rounded-lg">
                    <button className="flex items-center text-md" onClick={toggleLogoutConfirmation}>
                      Salir
                    </button>
                  </div>
                </div>
                <div className="sm:hidden">
                  <button onClick={toggleMenu} className="text-gray-500 focus:outline-none">
                    <FaBars className="text-2xl" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/authTabs')}
                className="bg-sky-600 text-white font-medium py-2 px-4 h-12 rounded-lg"
              >
                Iniciar sesión | Registrarse
              </button>
            )}
          </div>
        </div>

        {/* Modal de confirmación de logout */}
        {showLogoutConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex justify-center items-center">
            <div className="bg-white p-10 rounded-md flex flex-col gap-2 items-center">
              <p className="text-gray-500 text-7xl"><FaDoorOpen /></p>
              <p className="text-gray-500 font-bold">¿Estás seguro que quieres cerrar sesión?</p>
              <div className="flex justify-around gap-5 mt-4 p-1">
                <button onClick={handleLogout} className="bg-amber-600 text-white font-medium px-4 py-2 rounded-lg">Confirmar</button>
                <button onClick={() => setShowLogoutConfirmation(false)} className="bg-gray-300 text-black px-10 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, linkName, onClick }) => (
  <Link to={to} onClick={onClick} className="xl:px-4 px-6 py-2 font-medium rounded-md text-gray-500 hover:text-sky-600">
    {linkName}
  </Link>
);

export default Navbar;
