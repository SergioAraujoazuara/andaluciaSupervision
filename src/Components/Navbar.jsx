import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDoc, doc } from 'firebase/firestore';
import Imagen from '../assets/tpf_marca.png'; // Asegúrate de que la ruta de la imagen está correcta
import { db } from '../../firebase_config';

import { FaUserAlt, FaDoorOpen, FaBars, FaCaretDown } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userRol, setUserRol] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // Estado para el menú móvil
  const [dropdownOpen, setDropdownOpen] = useState(false); // Estado del menú desplegable
  const location = useLocation();

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
                <NavLink to="/" linkName="Home" />
                {(userRol === 'usuario' || userRol === 'admin') && (
                  <NavLink to="/elemento/proyecto" linkName="Inspección" />
                )}
                {(userRol === 'usuario' || userRol === 'admin') && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-sky-600"
                    >
                      Parte de obra <FaCaretDown />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute bg-white shadow-lg rounded-md mt-2 py-2 w-48 z-50">
                        <Link
                          to="/formularios"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Formulario
                        </Link>
                        <Link
                          to="/verRegistros"
                          className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Registros
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink to="/dashboard" linkName="Dashboard" />
                )}
                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink to="/visor_inspeccion" linkName="BIM" />
                )}
                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink to="/admin" linkName="Administración" />
                )}
              </div>
            )}
          </div>

          {/* Botón de usuario */}
          <div className="flex items-center">
            {user ? (
              <>
                <div className='hidden sm:flex items-center font-medium text-gray-500 pr-5 gap-5 text-base'>
                  <div className='flex gap-2 items-center text-gray-500'>
                    <FaUserAlt className=' hidden xl:block' />
                    <p className=' hidden xl:block'>{userNombre || 'Usuario'}</p>
                  </div>
                  <div className="relative bg-sky-600 text-white px-4 py-2 rounded-lg">
                    <button className="flex items-center text-md" onClick={toggleLogoutConfirmation}>
                      Salir
                    </button>
                  </div>
                </div>
                <div className="sm:hidden">
                  <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 focus:outline-none">
                    <FaBars className="text-2xl" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/authTabs')}
                className="bg-sky-600 text-white font-medium py-2 px-4 h-12 rounded-lg "
              >
                Iniciar sesión | Registrarse
              </button>
            )}
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="sm:hidden mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink to="/" linkName="Home" />
              {(userRol === 'usuario' || userRol === 'admin') && (
                <NavLink to="/elemento/proyecto" linkName="Inspección" />
              )}
              {(userRol === 'usuario' || userRol === 'admin') && (
                <div>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Parte de obra <FaCaretDown />
                  </button>
                  {dropdownOpen && (
                    <div className="ml-4">
                      <Link
                        to="/formularios"
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Formulario
                      </Link>
                      <Link
                        to="/ver-registros"
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Registros
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {(userRol === 'admin' || userRol === 'usuario') && (
                <NavLink to="/admin" linkName="Administración" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de logout */}
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex justify-center items-center">
          <div className="bg-white p-10 rounded-md flex flex-col gap-2 items-center">
            <p className='text-gray-500 text-7xl'><FaDoorOpen /></p>
            <p className="text-gray-500 font-bold">¿Estás seguro que quieres cerrar sesión?</p>
            <div className="flex justify-around gap-5 mt-4 p-1">
              <button onClick={handleLogout} className="bg-amber-600 text-white font-medium px-4 py-2 rounded-lg">Confirmar</button>
              <button onClick={() => setShowLogoutConfirmation(false)} className="bg-gray-300 text-black px-10 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLink = ({ to, linkName }) => {
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-sky-600"
    >
      {linkName}
    </Link>
  );
};

export default Navbar;
