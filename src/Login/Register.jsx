import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase_config';
import { useAuth } from '../context/authContext';
import { doc, setDoc } from 'firebase/firestore';
import { MdOutlineEmail, MdDriveFileRenameOutline } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import Logo_solo from '../assets/logo_solo.png';
import AlertaRegister from '../Alertas/AlertaRegister'; // Asegúrate de que este componente esté creado
import { FaArrowAltCircleRight } from "react-icons/fa";
const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newUser.password !== newUser.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setShowModal(true);
      return;
    }

    try {
      const authResult = await signup(newUser.email, newUser.password);
      const userId = authResult.user.uid;

      const userData = {
        uid: userId,
        nombre: newUser.name,
        email: newUser.email,
        proyectos: [],
        role: 'usuario',
      };

      await setDoc(doc(db, 'usuarios', userId), userData);

      navigate('/'); // Navegar a la página de inicio después del registro
    } catch (error) {
      let errorMessage = 'Error al registrar la cuenta';
      // Manejar errores específicos aquí
      setError(errorMessage);
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-200">
      <div className="w-full h-2/3 max-w-4xl mx-auto  mb-56 bg-white rounded-2xl shadow-2xl overflow-hidden flex">

       

        <div className="md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-5">
            
            <h1 className="text-3xl font-semibold text-gray-700 my-4">Registro</h1>
          </div>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col mb-4">
              <div className="relative">
                <MdDriveFileRenameOutline className="absolute left-0 top-0 m-3" />
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={newUser.name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <div className="relative">
                <MdOutlineEmail className="absolute left-0 top-0 m-3" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={newUser.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <div className="relative">
                <RiLockPasswordLine className="absolute left-0 top-0 m-3" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={newUser.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col mb-6">
              <div className="relative">
                <RiLockPasswordLine className="absolute left-0 top-0 m-3" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  className="w-full px-12 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-teal-500"
                  value={newUser.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <button type="submit" className="bg-amber-600 text-white w-full py-2 rounded-lg hover:bg-amber-700 focus:outline-none">
                Register
              </button>
            </div>
          </form>
          {showModal && <AlertaRegister message={error} closeModal={closeModal} />}
        </div>

        <div className="md:w-1/2 bg-sky-600 text-white flex flex-col justify-center px-10 pb-10">
          
          <div className='flex justify-center'>
          <img src={Logo_solo} width={150} alt="logo" className="mb-5" />
          </div>
          
          <h2 className="text-5xl font-bold text-center">Tpf ingeniería</h2>
          
         
          <p className="mb-4 text-center text-xl my-6">Building the world, better</p>
          <div className='flex justify-center mt-2'>
          <button onClick={() => navigate('/signin')} className="flex items-center gap-3 text-sky-600 font-semibold bg-white py-2 px-4 rounded-full shadow-md">
            <span className='text-amber-500'><FaArrowAltCircleRight /></span>
            Área inspección
          </button>
          </div>
          
        </div>

      </div>
    </div>
  );
}

export default Register;
