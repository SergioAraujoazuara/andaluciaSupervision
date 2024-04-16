import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { MdOutlineEmail, MdPersonOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Logo_solo from '../assets/logo_solo.png';
import AlertLogin from './AlertLogin'; // Asume que este componente ya está creado
import { FaArrowAltCircleRight } from "react-icons/fa";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(credentials.email, credentials.password);
      navigate('/');
    } catch (error) {
      let errorMessage = 'Email o contraseña incorrectos';
      // Aquí agregar más manejo de errores basado en error.code
      setError(errorMessage);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="w-full max-w-4xl mx-auto mb-56 flex bg-white rounded-2xl shadow-xl overflow-hidden ">
        
        <div className="md:w-1/2 bg-sky-600 text-white flex flex-col justify-center px-10">
          <h2 className="text-4xl font-bold mb-2">Tpf ingeniería</h2>
          <p className="mb-4">Building the world, better</p>
          <button onClick={() => navigate('/signin')} className="flex items-center gap-3 text-sky-500 font-semibold bg-white w-full py-2 px-4 rounded-full shadow-md">
           <span className='text-amber-500'><FaArrowAltCircleRight/></span> 
            Área inspección
          </button>
        </div>
        
        <div className="md:w-1/2 flex p-10 flex-col justify-center bg-gray-100">
          <div className="text-center mb-5">
            <img src={Logo_solo} width={200} alt="logo" className="mx-auto" />
            <h1 className="text-3xl font-semibold text-gray-500 my-4">Login</h1>
          </div>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col mb-4">
              <div className="relative">
                <MdOutlineEmail className="absolute left-0 top-0 m-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col mb-6">
              <div className="relative">
                <RiLockPasswordLine className="absolute left-0 top-0 m-3" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="bg-amber-600 text-white w-full py-2 rounded-lg hover:bg-amber-700 focus:outline-none">
                SIGN UP
              </button>
            </div>
          </form>
          {showModal && <AlertLogin message={error} closeModal={closeModal} />}
        </div>
        
      </div>
    </div>
  );
}

export default Login;
