import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDoc, doc } from 'firebase/firestore';
import Imagen from '../assets/tpf_marca.png';  // Asegúrate de que la ruta de la imagen está correcta
import { db } from '../../firebase_config';

import { FaUserAlt, FaDoorOpen } from "react-icons/fa";
import { ImExit } from "react-icons/im";
import { IoIosSettings } from "react-icons/io";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const [userRol, setUserRol] = useState('');
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
  };

  const toggleLogoutConfirmation = () => setShowLogoutConfirmation(!showLogoutConfirmation);

  const handleLogout = async () => {
    await logout();
    navigate('/authTabs');
    setShowLogoutConfirmation(false);
  };

  const isAuthTabs = location.pathname === '/authTabs';

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-10">
        <div className="flex justify-between items-center h-24">
          <div className="flex gap-10">
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
                    to="/admin"
                    linkName="Administración"
                    activeLink={activeLink}
                    handleLinkClick={handleLinkClick}
                  />
                )}
              </div>
            )}
          </div>
          {user ? (
            <div className='flex items-center font-medium text-gray-500 pr-5 gap-5 text-base'>
              <div className='flex gap-2 items-center text-gray-500'>
                <FaUserAlt />
                <p>{userNombre || 'Usuario'}</p>
              </div>
              <div className="relative bg-sky-600 text-white px-4 py-2 rounded-full">
                <button className="flex items-center text-md" onClick={toggleLogoutConfirmation}>
                  {showLogoutConfirmation ? <span className='text-xl flex items-center'><IoIosSettings /></span> : <span className='text-md'><ImExit /></span>}
                </button>
              </div>
            </div>
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
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex justify-center items-center">
          <div className="bg-white p-10 rounded-md flex flex-col gap-2 items-center">
            <p className='text-gray-500 text-7xl'><FaDoorOpen /></p>
            <p className="text-gray-500 font-bold">¿Estás seguro que quieres cerrar sesión?</p>
            <div className="flex justify-around gap-5 mt-4 p-1">
              <button onClick={handleLogout} className="bg-amber-600 text-white font-medium px-4 py-2 rounded-full">Confirmar</button>
              <button onClick={() => setShowLogoutConfirmation(false)} className="bg-gray-300 text-black px-10 py-2 rounded-full">Cancelar</button>
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
  const textColorClass = isActive ? 'text-sky-600' : 'text-gray-300';

  return (
    <Link
      to={to}
      onClick={() => handleLinkClick(to)}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-md font-medium ${borderColorClass} ${textColorClass}`}
    >
      {linkName}
    </Link>
  );
};

export default Navbar;
