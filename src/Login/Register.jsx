import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase_config";
import { useAuth } from "../context/authContext";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import Logo_solo from "../assets/logo_solo.png";
import PasswordInput from "./PasswordInput";
import { validatePassword } from "../utils/passwordValidation";


const Register = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [dominiosPermitidos, setDominiosPermitidos] = useState([]);
  const [emailError, setEmailError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Cargar dominios permitidos al montar el componente
  useEffect(() => {
    cargarDominiosPermitidos();
  }, []);

  const cargarDominiosPermitidos = async () => {
    try {
      const dominiosRef = collection(db, "dominiosPermitidos");
      const snapshot = await getDocs(dominiosRef);
      const dominiosData = snapshot.docs.map(doc => doc.data().dominio);
      setDominiosPermitidos(dominiosData);
    } catch (error) {
      console.error("Error al cargar dominios permitidos:", error);
    }
  };

  const validarEmail = (email) => {
    // Validación básica de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Formato de email inválido";
    }

    // Validar dominio permitido
    const dominio = email.split("@")[1]?.toLowerCase();
    if (!dominio) {
      return "Email inválido";
    }

    if (dominiosPermitidos.length > 0 && !dominiosPermitidos.includes(dominio)) {
      return `El dominio ${dominio} no está permitido`;
    }

    return "";
  };

  const handleChange = ({ target: { name, value } }) => {
    setNewUser({ ...newUser, [name]: value });

    // Validar email en tiempo real
    if (name === "email") {
      setEmailError("");
      if (value.trim()) {
        const error = validarEmail(value);
        setEmailError(error);
      }
    }

    // Validar contraseña en tiempo real
    if (name === "password") {
      setPasswordError("");
      if (value.trim()) {
        const validation = validatePassword(value);
        if (!validation.isValid) {
          setPasswordError("La contraseña no cumple con los requisitos de seguridad");
        }
      }
    }

    // Validar confirmación de contraseña
    if (name === "confirmPassword") {
      setConfirmPasswordError("");
      if (value.trim() && newUser.password !== value) {
        setConfirmPasswordError("Las contraseñas no coinciden");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // Validar campos requeridos
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password || !newUser.confirmPassword) {
      setError("Todos los campos son requeridos.");
      return;
    }

    // Validar email
    const emailValidationError = validarEmail(newUser.email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validar contraseña con nuevos requisitos
    const passwordValidation = validatePassword(newUser.password);
    if (!passwordValidation.isValid) {
      setPasswordError("La contraseña no cumple con los requisitos de seguridad");
      setError("La contraseña debe cumplir con todos los requisitos de seguridad.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (newUser.password !== newUser.confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsValidating(true);

    try {
      const authResult = await signup(newUser.email, newUser.password);
      const userId = authResult.user.uid;

      const userData = {
        uid: userId,
        nombre: newUser.name,
        email: newUser.email,
        proyectos: [],
        role: "invitado",
      };

      await setDoc(doc(db, "usuarios", userId), userData);

      navigate("/");
    } catch (error) {
      let errorMessage = "Error al registrar la cuenta";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email ya está registrado.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "El formato del email es inválido.";
      }
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="w-full px-6 py-8 sm:px-10">
      <div className="w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white border border-gray-200 rounded-xl mb-4 shadow-sm overflow-hidden">
            <img src={Logo_solo} alt="logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-base font-semibold text-gray-900 tracking-tight">Crear cuenta</h1>
          <p className="mt-2 text-sm text-gray-500">Completa tus datos para registrarte</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label htmlFor="name" className="block text-[11px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                Nombre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-700 group-focus-within:text-slate-700 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.963 9.963 0 0112 15c2.53 0 4.847.94 6.879 2.492M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 focus:border-sky-700 focus:ring-2 focus:ring-sky-700/20 text-gray-800 placeholder-gray-400 transition-all duration-200 bg-white rounded-xl"
                  value={newUser.name}
                  onChange={handleChange}
                />
              </div>
            </div>

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
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-3 py-2.5 text-sm border focus:ring-2 text-gray-800 placeholder-gray-400 transition-all duration-200 bg-white rounded-xl ${
                    emailError ? "border-red-400 focus:border-red-500 focus:ring-red-400/20" : "border-gray-300 focus:border-sky-700 focus:ring-sky-700/20"
                  }`}
                  value={newUser.email}
                  onChange={handleChange}
                />
              </div>
              {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
            </div>

            <div className="flex flex-col">
              <PasswordInput
                name="password"
                placeholder="Contraseña"
                value={newUser.password}
                onChange={handleChange}
                showStrengthIndicator={true}
                showGenerator={true}
                showExamples={false}
                error={passwordError}
              />
            </div>
            <div className="flex flex-col">
              <PasswordInput
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={newUser.confirmPassword}
                onChange={handleChange}
                showStrengthIndicator={false}
                showGenerator={false}
                showExamples={false}
                error={confirmPasswordError}
              />
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isValidating || !!emailError || !!passwordError || !!confirmPasswordError}
                className={`w-full rounded-xl border-0 font-semibold py-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-700/30 focus:ring-offset-0 ${
                  isValidating || emailError || passwordError || confirmPasswordError
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-sky-700 text-white hover:opacity-95"
                }`}
              >
                {isValidating ? "Registrando..." : "Crear cuenta"}
              </button>
            </div>
          </form>

          
        </div>
      </div>
    </div>
  );
};

export default Register;
