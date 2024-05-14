import React from 'react';
import { useAuth } from './context/authContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoutes({ children, allowedRoles }) {
    const { user, role, loading } = useAuth(); // Obten el role del contexto

    if (loading) return <h1>Cargando...</h1>; // Muestra un mensaje de carga mientras los datos están pendientes

    // Si no hay usuario o el rol del usuario no está dentro de los roles permitidos, redirige
    if (!user || (allowedRoles && !allowedRoles.includes(role))) {
        return <Navigate to='/authTabs' />;
    }

    return <>{children}</>; // Si el usuario está autenticado y tiene un rol adecuado, muestra el contenido protegido
}

export default ProtectedRoutes;
