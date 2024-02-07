import React from 'react';
import logo from '../assets/logo_solo.png';

import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = React.useState(location.pathname);
  const [projectName, setProjectName] = React.useState('');

  // Obtener el nombre del proyecto del almacenamiento local
  React.useEffect(() => {
    const storedProjectName = localStorage.getItem('proyectoNombre');
    setProjectName(storedProjectName);
    setActiveLink(location.pathname);
  }, [location.pathname]);

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
              {location.pathname !== '/' && location.pathname !== '/admin' && (
              
                <Link
                  to="/"
                  onClick={() => handleLinkClick('/')}
                  className={`flex items-center px-1 pt-1 border-b-2 border-sky-500 text-sky-600 text-base font-medium flex-grow flex-grow`}
                >
                  {projectName || 'Proyecto'}
                </Link>
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
