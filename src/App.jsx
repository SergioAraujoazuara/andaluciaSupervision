import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import AuthTabs from './Login/AuthTabs.jsx';
import { AuthProvider } from './context/authContext.jsx';
import ProtectedRoutes from './Routes/ProtectedRoutes.jsx';
import AdminHome from './Pages/Administrador/AdminHome';
import Trazabilidad from './Pages/Administrador/Trazabilidad';
import Viewer_admin from './Pages/BIM/Viewer_admin';
import VerPpis from './Pages/Administrador/VerPpis';
import AgregarPPi from './Pages/Administrador/AgregarPPi';
import Roles from './Pages/Administrador/Roles';
import Viewer_inspeccion from './Pages/BIM/Viewer_inspeccion';
import Elemento from './Pages/Inspeccion/Elemento';
import TablaPpi from './Pages/Inspeccion/TablaPpi';
import EditarPpi from './Pages/Administrador/EditarPpi';
import FormularioInspeccion from './Components/FormularioInspeccion';
import Pdf_final from './Components/Pdf_final';
import GrocIA from './Components/GrocIA.jsx';
import Dashboard from './Pages/Inspeccion/Dashboard.jsx';
import SendMail from './Components/FeatureSendMail/SendMail.jsx';
import ParteObra from './Pages/ParteObra/ParteObra.jsx';
import SistemaDePestanas from './Pages/ParteObra/SistemaPestanas.jsx';
import GridParteDeObra from './Pages/ParteObra/GridParteDeObra.jsx';
import TablaRegistrosTrazabilidad from './Pages/ParteObra/TablaRegistrosTrazabilidad.jsx';
import ViewProject from './Pages/Administrador/ViewProject.jsx';
import Horta from './Pages/Auscultacion/Horta.jsx';
import Glorias from './Pages/Auscultacion/Glorias.jsx';
import Llacuna from './Pages/Auscultacion/Llacuna.jsx';
import Projects from './Pages/Administrador/CreateProject/Projects.jsx';
import ParteObraTrazabilidad from './Pages/ParteObra/ParteDeObraTrazabilidad.jsx';
import TablaRegistrosActaReunion from './Pages/ParteObra/tablaRegistrosActasReunion.jsx';

// App.js
// This is the main entry point for the application. It defines the routing structure
// for the application using React Router and organizes routes into Public, Admin, and Inspection sections.
// The file also integrates global components like the Navbar, Footer, and Authentication Context.

function App() {
  // publicRoutes
  // These routes are accessible without authentication.
  const publicRoutes = [
    { path: '/', element: <Home /> },
    { path: '/authTabs', element: <AuthTabs /> },
    { path: '/groc', element: <GrocIA /> },
    { path: '/sendEmail', element: <SendMail /> },

  ];
  // adminRoutes
  // Routes restricted to admin users (and optionally general users).
  const adminRoutes = [
    { path: '/admin', element: <AdminHome />, roles: ['admin', 'usuario'] },
    { path: '/trazabilidad/:id', element: <Trazabilidad />, roles: ['admin', 'usuario'] },
    { path: '/formularios/:id', element: <SistemaDePestanas />, roles: ['admin', 'usuario'] },
    { path: '/visorAdmin', element: <Viewer_admin />, roles: ['admin', 'usuario'] },
    { path: '/verPPis', element: <VerPpis />, roles: ['admin'] },
    { path: '/agregarPpi', element: <AgregarPPi />, roles: ['admin'] },
    { path: '/roles', element: <Roles />, roles: ['admin'] },
    { path: '/project', element: <Projects />, roles: ['admin'] },
  ];

  // inspectionRoutes
  // Routes dedicated to inspections, monitoring, and work logs.
  const inspectionRoutes = [
    { path: '/visor_inspeccion', element: <Viewer_inspeccion />, roles: ['admin', 'usuario'] },
    { path: '/elemento/:id', element: <Elemento />, roles: ['admin', 'usuario'] },
    { path: '/dashboard', element: <Dashboard />, roles: ['admin', 'usuario'] },
    { path: '/tablaPpi', element: <TablaPpi />, roles: ['admin', 'usuario'] },
    { path: '/tablaPpi/:idLote/:ppiNombre', element: <TablaPpi />, roles: ['admin', 'usuario'] },
    { path: '/editarPpi/:id', element: <EditarPpi />, roles: ['admin', 'usuario'] },
    { path: '/formularioInspeccion/:idLote/:id', element: <FormularioInspeccion />, roles: ['admin', 'usuario'] },
    { path: '/pdf_final', element: <Pdf_final />, roles: ['admin', 'usuario'] },

    // Parte de obra
    { path: '/parteObra', element: <GridParteDeObra />, roles: ['admin', 'usuario'] },
    { path: '/formularios', element: <ParteObraTrazabilidad />, roles: ['admin', 'usuario'] },
    { path: '/verRegistros', element: <TablaRegistrosTrazabilidad />, roles: ['admin', 'usuario'] },
    { path: '/verRegistrosActasReunion', element: <TablaRegistrosActaReunion />, roles: ['admin', 'usuario'] },

    // Auscultación
    { path: '/auscultacion', element: <GridParteDeObra />, roles: ['admin', 'usuario'] },
    { path: '/auscultacion/glorias', element: <Glorias />, roles: ['admin', 'usuario'] },
    { path: '/auscultacion/llacuna', element: <Llacuna />, roles: ['admin', 'usuario'] },
    { path: '/auscultacion/horta', element: <Horta />, roles: ['admin', 'usuario'] },
  ];

  // Main Application Component (App)
  // - Integrates global context (AuthProvider) for managing user authentication and roles.
  // - Renders a Navbar and Footer globally across all pages.
  // - Defines Routes for Public, Admin, and Inspection sections.
  // - Implements ProtectedRoutes to ensure role-based access control.
  
  return (
    <AuthProvider> {/* Provides authentication context globally */}

      <Navbar />
      <Routes>
        {publicRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
        {adminRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<ProtectedRoutes allowedRoles={route.roles}>{route.element}</ProtectedRoutes>}
          />
        ))}
        {inspectionRoutes.map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={<ProtectedRoutes allowedRoles={route.roles}>{route.element}</ProtectedRoutes>}
          />
        ))}
      </Routes>
      <Footer />

    </AuthProvider>
  );
}

export default App;
