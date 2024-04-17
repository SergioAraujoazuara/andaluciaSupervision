import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getDoc, doc } from 'firebase/firestore';
import Imagen from '../assets/tpflogo.png';  // Asegúrate de que la ruta de la imagen está correcta
import { db } from '../../firebase_config';

import { FaUserAlt, FaDoorOpen } from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [userNombre, setUserNombre] = useState('');
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'usuarios', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserNombre(userData.nombre);
        }
      });
    } else {
      setUserNombre('');
    }
  }, [user]);

  const [activeLink, setActiveLink] = useState(location.pathname);

  const handleLinkClick = (linkName) => {
    setActiveLink(linkName);
  };

  const toggleProfileDropdown = () => setShowProfileDropdown(!showProfileDropdown);
  const toggleLogoutConfirmation = () => setShowLogoutConfirmation(!showLogoutConfirmation);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirmation(false);
    setShowProfileDropdown(false);
    setShowMenu(false);
  };

  return (
    <nav className="bg-white shadow">
      <div className="px-20">
        <div className="flex justify-between h-30">
          <div className="flex gap-10">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-auto" src={Imagen} width={220} alt="logo" />
            </div>
            {user && (
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
            )}
          </div>
          {user && (
            <div className='flex items-center font-medium text-gray-500 pr-5 gap-12 text-base'>
              <div className='flex gap-3 items-center text-lg text-sky-700 font-bold'>
                <FaUserAlt />
                <p>{userNombre || 'Usuario'}</p>
              </div>
              <div className="relative bg-gray-500 text-white px-4 py-2 rounded-lg">
                <button className="flex gap-4 items-center text-lg font-bold" onClick={toggleProfileDropdown}>
                  <p>Salir</p>
                  {showProfileDropdown ? <span className='text-xl'><IoIosSettings /></span> : <span className='text-xl'><FaDoorOpen /></span>}
                </button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md">
                    <button className="px-4 py-2 text-gray-800 hover:bg-gray-300 w-full" onClick={toggleLogoutConfirmation}>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showLogoutConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-10 flex justify-center items-center">
          <div className="bg-white p-10 rounded-lg flex flex-col gap-2 items-center">
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
  const textColorClass = isActive ? 'text-sky-600' : 'text-gray-300';

  return (
    <Link
      to={to}
      onClick={() => handleLinkClick(to)}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-lg font-bold ${borderColorClass} ${textColorClass}`}
    >
      {linkName}
    </Link>
  );
};

export default Navbar;
