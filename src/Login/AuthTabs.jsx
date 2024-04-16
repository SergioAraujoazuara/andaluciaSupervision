import React, { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import { useAuth } from '../context/authContext.jsx';
import { useNavigate } from 'react-router-dom';

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const switchToLogin = () => setActiveTab('login');
  const switchToRegister = () => setActiveTab('register');

  return (
    <div className='bg-gray-200'>
      
       
      <div className="mb-5 flex justify-center pt-10">
          <div className="inline-block border rounded-xl overflow-hidden">
            <button
              className={`text-lg font-medium px-6 py-2 ${activeTab === 'login' ? 'bg-sky-600 text-white' : 'bg-white text-sky-500 hover:bg-gray-100'}`}
              onClick={switchToLogin}
            >
              Iniciar Sesión
            </button>
            <button
              className={`text-lg font-medium px-6 py-2 ${activeTab === 'register' ? 'bg-sky-600 text-white' : 'bg-white text-sky-500 hover:bg-gray-100'}`}
              onClick={switchToRegister}
            >
              Registrarse
            </button>
          </div>
        </div>
        
        

      <div className='ps-5'>
      {activeTab === 'login' ? <Login /> : <Register />}
      </div>
      
    </div>
  );
};

export default AuthTabs;
