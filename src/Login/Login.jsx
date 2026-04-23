import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Logo_solo from "../assets/logo_solo.png";
import RecoverPassword from "./RecoverPassword";

function Login() {
  const {
    login,
    loginWithMicrosoft,
    getMicrosoftLinkDataFromError,
    linkMicrosoftWithPassword,
  } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoverPassword, setShowRecoverPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMicrosoft, setLoadingMicrosoft] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linkMethods, setLinkMethods] = useState([]);
  const [pendingMicrosoftCredential, setPendingMicrosoftCredential] = useState(null);
  const [linkError, setLinkError] = useState("");
  const [linking, setLinking] = useState(false);

  const getMicrosoftErrorMessage = (code) => {
    if (code === "auth/popup-closed-by-user") return "Se canceló el acceso de Microsoft.";
    if (code === "auth/popup-blocked") return "El navegador bloqueó la ventana emergente. Permítela e inténtalo de nuevo.";
    if (code === "auth/account-exists-with-different-credential") return "Esta cuenta ya existe con otro método de inicio de sesión.";
    if (code === "auth/unauthorized-domain") return "El dominio actual no está autorizado en Firebase Authentication.";
    return "No se pudo iniciar sesión con Microsoft 365.";
  };

  const handleChange = ({ target: { name, value } }) => {
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(credentials.email, credentials.password);
      navigate("/");
    } catch (err) {
      setError("Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError("");
    setLoadingMicrosoft(true);
    try {
      await loginWithMicrosoft();
      navigate("/");
    } catch (err) {
      if (err?.code === "auth/account-exists-with-different-credential") {
        try {
          const linkData = await getMicrosoftLinkDataFromError(err);
          if (linkData?.pendingCredential && linkData?.email) {
            setPendingMicrosoftCredential(linkData.pendingCredential);
            setLinkEmail(linkData.email);
            setLinkMethods(linkData.methods || []);
            setLinkPassword("");
            setLinkError("");
            setShowLinkModal(true);
            setError("");
            return;
          }
        } catch (linkDataError) {
          console.error("Error preparando vinculación de cuenta:", linkDataError);
        }
      }
      setError(getMicrosoftErrorMessage(err?.code));
    } finally {
      setLoadingMicrosoft(false);
    }
  };

  const closeLinkModal = () => {
    setShowLinkModal(false);
    setLinkPassword("");
    setLinkError("");
    setPendingMicrosoftCredential(null);
    setLinkMethods([]);
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLinkError("");
    if (!linkPassword.trim()) {
      setLinkError("Escribe tu contraseña para vincular la cuenta.");
      return;
    }
    if (!pendingMicrosoftCredential) {
      setLinkError("No se encontró la credencial pendiente de Microsoft. Vuelve a intentarlo.");
      return;
    }

    setLinking(true);
    try {
      await linkMicrosoftWithPassword(linkEmail, linkPassword, pendingMicrosoftCredential);
      closeLinkModal();
      navigate("/");
    } catch (err) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setLinkError("La contraseña no es correcta.");
      } else if (err?.code === "auth/too-many-requests") {
        setLinkError("Demasiados intentos. Espera unos minutos y vuelve a intentarlo.");
      } else {
        setLinkError("No se pudo vincular la cuenta. Inténtalo de nuevo.");
      }
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-10">
      <div className="w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden">
            <img src={Logo_solo} alt="logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-gray-500">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 text-sm rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="group">
              <label htmlFor="email" className="block text-[11px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-700 group-focus-within:text-slate-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20 text-gray-800 placeholder-gray-400 transition-all duration-200 bg-white rounded-xl"
                  placeholder="tu@email.com"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="group">
              <label htmlFor="password" className="block text-[11px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-700 group-focus-within:text-slate-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20 text-gray-800 placeholder-gray-400 transition-all duration-200 bg-white rounded-xl"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-700 hover:text-slate-900 transition-colors duration-200"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowRecoverPassword(true)}
                className="text-xs text-sky-700 hover:text-sky-700 hover:underline transition-colors duration-200"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-0 bg-sky-700 text-white font-semibold py-3 text-sm transition-colors duration-200 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-sky-700/30 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </button>

              <button
                type="button"
                onClick={handleMicrosoftLogin}
                disabled={loading || loadingMicrosoft}
                className="mt-3 w-full rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold py-3 text-sm flex items-center justify-center gap-3 shadow-sm hover:bg-gray-50 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="inline-grid grid-cols-2 gap-0.5 w-4 h-4" aria-hidden="true">
                  <span className="bg-[#f25022]" />
                  <span className="bg-[#7fba00]" />
                  <span className="bg-[#00a4ef]" />
                  <span className="bg-[#ffb900]" />
                </span>
                <span>{loadingMicrosoft ? "Conectando con Microsoft..." : "Acceso Microsoft 365"}</span>
              </button>
            </div>
          </form>

          {showRecoverPassword && <RecoverPassword />}

          {showLinkModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
              <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Vincular cuenta de Microsoft
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Ya existe una cuenta para <span className="font-semibold">{linkEmail}</span>.  
                  Inicia con tu contraseña para vincular Microsoft 365.
                </p>
                {linkMethods.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Métodos detectados: {linkMethods.join(", ")}
                  </p>
                )}

                <form className="mt-4 space-y-4" onSubmit={handleLinkAccount}>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm border border-gray-300 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20 text-gray-800 placeholder-gray-400 transition-all duration-200 bg-white rounded-xl"
                      placeholder="Introduce tu contraseña"
                      autoComplete="current-password"
                    />
                  </div>

                  {linkError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-3 py-2 text-sm rounded-r-lg">
                      {linkError}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={closeLinkModal}
                      className="flex-1 rounded-xl border border-gray-300 text-gray-700 font-semibold py-2.5 text-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={linking}
                      className="flex-1 rounded-xl border-0 bg-sky-700 text-white font-semibold py-2.5 text-sm hover:opacity-95 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {linking ? "Vinculando..." : "Vincular cuenta"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
