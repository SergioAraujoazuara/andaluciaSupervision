// src/components/Footer.js
import React from 'react';
import logo from '../assets/tpflogo.png';
import { Link } from 'react-router-dom';
import { TfiWorld } from 'react-icons/tfi';
import { FaInstagram } from 'react-icons/fa';
import { AiOutlineLinkedin } from 'react-icons/ai';
import { MdOutlinePowerSettingsNew } from 'react-icons/md';
import { FaUserAlt } from "react-icons/fa";
import { MdBuildCircle } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { GiHamburgerMenu } from "react-icons/gi";

const Footer = () => {
  return (
    <footer className="bg-white text-gray-500 p-5 flex items-center justify-center gap-3">
      <div className="text-center lg:mr-4 mb-2 lg:mb-0">
        <img src={logo} width={150} alt="logo footer" className="mx-auto mr-8" />
      </div>
      <div>
        <p className='text-md font-medium'>
          C. de Ramón de Aguinaga, 8, Salamanca, 28028 Madrid
        </p>
      </div>






      {/* Cuarta Columna - Número de Teléfono */}
      <div className="text-center lg:text-center">
        <p className=' text-md font-medium'>+34 914 18 21 10</p>

      </div>

      <div className='flex gap-2 ms-10'>


        <div>
          <Link to="https://tpf.eu/en" className="  hover:text-gray-300" >
            <TfiWorld style={{ fontSize: 30 }} />
          </Link>
        </div>
        <div>
          <Link to="https://www.instagram.com/tpfingenieria/" className=" hover:text-gray-300" >
            <FaInstagram style={{ fontSize: 30 }} />
          </Link>
        </div>
        <div>
          <Link to="https://www.linkedin.com/company/tpfingenieria/" className="hover:text-gray-300" >
            <AiOutlineLinkedin style={{ fontSize: 30 }} />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
