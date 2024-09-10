import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDoc, doc } from 'firebase/firestore';
import Imagen from '../assets/tpf_marca.png';  // Asegúrate de que la ruta de la imagen está correcta
import { db } from '../../firebase_config';

import { FaUserAlt, FaDoorOpen, FaBars } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { IoIosSettings } from "react-icons/io";


const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userRol, setUserRol] = useState('');
  const [menuOpen, setMenuOpen] = useState(false); // Estado para el menú desplegable
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'usuarios', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserNombre(userData.nombre);
          setUserRol(userData.role);
          console.log(userData.role);
        }
      });
    } else {
      setUserNombre('');
      setUserRol('');
    }
  }, [user]);

  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
    setMenuOpen(false); // Cierra el menú cuando se selecciona un enlace
  };

  const toggleLogoutConfirmation = () => setShowLogoutConfirmation(!showLogoutConfirmation);

  const handleLogout = async () => {
    await logout();
    navigate('/authTabs');
    setShowLogoutConfirmation(false);
  };

  const isAuthTabs = location.pathname === '/authTabs';

  return (
    <nav className="bg-red-400 shadow">
      <div className="container mx-auto ps-0 pr-4 xl:px-10">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center gap-10">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-auto" src={Imagen} width={150} alt="logo" />
            </div>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  linkName="Home"
                  activeLink={activeLink}
                  handleLinkClick={handleLinkClick}
                />

                {(userRol === 'usuario' || userRol === 'admin') && (
                  <NavLink
                    to="/elemento/proyecto"
                    linkName="Inspección"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )}
                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink
                    to="/dashboard"
                    linkName="Dashboard"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )}

                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink
                    to="/visor_inspeccion"
                    linkName="BIM"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )}

                {/* {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink
                    to="/auscultacion"
                    linkName="Auscultación"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )} */}


                {(userRol === 'admin' || userRol === 'usuario') && (
                  <NavLink
                    to="/admin"
                    linkName="Administración"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )}


              </div>
            )}
          </div>
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
                      {showLogoutConfirmation ? <span className='text-xl flex items-center'><IoIosSettings /></span> : <span className='text-md'>Salir</span>}
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
              !isAuthTabs && (
                <button
                  onClick={() => navigate('/authTabs')}
                  className="bg-sky-600 text-white font-medium py-2 px-4 h-12 rounded-lg "
                >
                  Iniciar sesión  |  Registrarse
                </button>
              )
            )}
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLink
                to="/"
                linkName="Home"
                activeLink={activeLink}
                handleLinkClick={handleLinkClick}
              />

              {(userRol === 'usuario' || userRol === 'admin') && (
                <NavLink
                  to="/elemento/proyecto"
                  linkName="Inspección"
                  activeLink={activeLink}
                  handleLinkClick={handleLinkClick}
                />
              )}

              {(userRol === 'admin' || userRol === 'usuario') && (
                <NavLink
                  to="/admin"
                  linkName="Administración"
                  activeLink={activeLink}
                  handleLinkClick={handleLinkClick}
                />
              )}

              {user && (
                <div className="flex flex-col items-start gap-2">
                  <div className='flex gap-2 items-center text-gray-500 mt-2'>
                    <FaUserAlt className='hidden xl:block' />
                    <p className='ps-3 font-medium text-gray-400'>{userNombre || 'Usuario'}</p>
                  </div>
                  <button
                    className="bg-gray-200 text-gray-500 font-medium px-4 py-2 rounded-lg w-1/2 text-left"
                    onClick={toggleLogoutConfirmation}
                  >
                    {showLogoutConfirmation ? <span className='flex items-center'><IoIosSettings />&nbsp;Cerrar Menú</span> : <span>Salir</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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

const NavLink = ({ to, linkName, activeLink, handleLinkClick }) => {
  const isActive = to === activeLink;
  const borderColorClass = isActive ? 'border-sky-600' : 'border-transparent';
  const textColorClass = isActive ? 'text-sky-600' : 'text-gray-500';

  return (
    <Link
      to={to}
      onClick={() => handleLinkClick(to)}
      className={`block px-3 py-2 rounded-md text-sm font-medium ${borderColorClass} ${textColorClass}`}
    >
      {linkName}
    </Link>
  );
};

export default Navbar;
