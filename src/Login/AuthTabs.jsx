import React, { useState, useEffect } from 'react';
import Login from './Login.jsx';
import Register from './Register.jsx';
import { useAuth } from '../context/authContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [ssoStatusMessage, setSsoStatusMessage] = useState('');
  const [showLandingSsoModal, setShowLandingSsoModal] = useState(false);
  const [landingSsoLoading, setLandingSsoLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, loginWithMicrosoft } = useAuth();

  const getMicrosoftErrorMessage = (code) => {
    if (code === 'auth/popup-blocked') return 'El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.';
    if (code === 'auth/popup-closed-by-user') return 'Se canceló el acceso con Microsoft.';
    if (code === 'auth/login-required' || code === 'auth/interaction-required') {
      return 'No se detectó una sesión activa de Microsoft. Continúa con selección de cuenta.';
    }
    if (code === 'auth/missing-initial-state') {
      return 'No se pudo completar el acceso silencioso. Continúa con selección de cuenta.';
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return 'Esta cuenta ya existe con otro método. Usa el botón de Microsoft del formulario de login para vincularla.';
    }
    return 'No se pudo completar el acceso corporativo.';
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (loading || user) return;
    const query = new URLSearchParams(location.search);
    const shouldPromptLandingSso = query.get('sso') === '1';
    setShowLandingSsoModal(shouldPromptLandingSso);
  }, [loading, user, location.search]);

  const switchToLogin = () => setActiveTab('login');
  const switchToRegister = () => setActiveTab('register');

  const handleContinueWithMicrosoft = async () => {
    setSsoStatusMessage('');
    setLandingSsoLoading(true);
    try {
      await loginWithMicrosoft({ prompt: 'select_account' });
      navigate('/');
    } catch (error) {
      setSsoStatusMessage(getMicrosoftErrorMessage(error?.code));
    } finally {
      setLandingSsoLoading(false);
      setShowLandingSsoModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex  mt-12 justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Acceso a plataforma AP4I - Seguridad y salud</h2>
          <p className="mt-1 text-sm text-gray-500">Entorno corporativo de supervisión de obra</p>
        </div>

        <div className="mb-5 flex justify-center">
          <div className="inline-flex gap-2 rounded-xl p-2 ">
            <button
              className={`text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200 shadow-md ${
                activeTab === 'login'
                  ? 'bg-sky-700 text-white'
                  : 'text-gray-600 hover:text-sky-700'
              }`}
              onClick={switchToLogin}
            >
              Iniciar Sesión
            </button>
            <button
              className={`text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200 shadow-md ${
                activeTab === 'register'
                  ? 'bg-sky-700 text-white'
                  : 'text-gray-600 hover:text-sky-700'
              }`}
              onClick={switchToRegister}
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          <div className="h-1 bg-sky-700" />
          {activeTab === 'login' ? <Login /> : <Register />}
        </div>

        {ssoStatusMessage && (
          <p className="text-center text-xs text-gray-500 mt-3">{ssoStatusMessage}</p>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Tpf ingeniería
        </p>
      </div>

      {showLandingSsoModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900">Acceso desde ERP</h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Quieres mantener tu sesión activa de Microsoft 365 para entrar de forma más rápida?
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLandingSsoModal(false)}
                className="flex-1 rounded-xl border border-gray-300 text-gray-700 font-semibold py-2.5 text-sm hover:bg-gray-50 transition-colors duration-200"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={handleContinueWithMicrosoft}
                disabled={landingSsoLoading}
                className="flex-1 rounded-xl border-0 bg-sky-700 text-white font-semibold py-2.5 text-sm hover:opacity-95 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {landingSsoLoading ? 'Abriendo...' : 'Sí, continuar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthTabs;
