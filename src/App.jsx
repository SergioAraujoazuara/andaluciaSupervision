import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Home from './Pages/Home';
import Navbar from './Components/Navbar';
import Footer from './Components/Footer';
import AuthTabs from './Login/AuthTabs.jsx';
import { AuthProvider } from './context/authContext.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import AdminHome from './Pages/Administrador/AdminHome';
import Trazabilidad from './Pages/Administrador/Trazabilidad';
import Viewer_admin from './Viewer_admin';
import VerPpis from './Pages/Administrador/VerPpis';
import AgregarPPi from './Pages/Administrador/AgregarPPi';
import Roles from './Pages/Administrador/Roles';
import Viewer_inspeccion from './Viewer_inspeccion';
import Elemento from './Pages/Elemento';
import TablaPpi from './Pages/TablaPpi';
import EditarPpi from './Pages/Administrador/EditarPpi';
import FormularioInspeccion from './Components/FormularioInspeccion';
import Pdf_final from './Components/Pdf_final';
import GrocIA from './Components/GrocIA.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Auscultacion from './Pages/Auscultacion.jsx';
import SendMail from './Components/FeatureSendMail/SendMail.jsx';
import ParteObra from './Pages/ParteObra/ParteObra.jsx';
import SistemaDePestanas from './Pages/ParteObra/SistemaPestanas.jsx';
import GridParteDeObra from './Pages/ParteObra/GridParteDeObra.jsx';
import TablaRegistros from './Pages/ParteObra/TablaRegistros.jsx';
import ViewProject from './Pages/Administrador/ViewProject.jsx';
import ApiRickYMorty from './ApiRickYMorty.jsx';


function App() {
  const publicRoutes = [
    { path: '/', element: <Home /> },
    { path: '/authTabs', element: <AuthTabs /> },
    { path: '/groc', element: <GrocIA /> },
    { path: '/sendEmail', element: <SendMail /> },
    
  ];

  const adminRoutes = [
    { path: '/admin', element: <AdminHome />, roles: ['admin', 'usuario'] },
    { path: '/trazabilidad/:id', element: <Trazabilidad />, roles: ['admin', 'usuario'] },
    { path: '/formularios/:id', element: <SistemaDePestanas />, roles: ['admin', 'usuario'] },
    { path: '/visorAdmin', element: <Viewer_admin />, roles: ['admin', 'usuario'] },
    { path: '/verPPis', element: <VerPpis />, roles: ['admin'] },
    { path: '/agregarPpi', element: <AgregarPPi />, roles: ['admin'] },
    { path: '/roles', element: <Roles />, roles: ['admin'] },
    { path: '/project', element: <ViewProject />, roles: ['admin'] },
  ];

  const inspectionRoutes = [
    { path: '/visor_inspeccion', element: <Viewer_inspeccion />, roles: ['admin', 'usuario'] },
    { path: '/elemento/:id', element: <Elemento />, roles: ['admin', 'usuario'] },
    { path: '/dashboard', element: <Dashboard />, roles: ['admin', 'usuario'] },
    { path: '/auscultacion', element: <Auscultacion />, roles: ['admin', 'usuario'] },
    { path: '/tablaPpi', element: <TablaPpi />, roles: ['admin', 'usuario'] },
    { path: '/tablaPpi/:idLote/:ppiNombre', element: <TablaPpi />, roles: ['admin', 'usuario'] },
    { path: '/editarPpi/:id', element: <EditarPpi />, roles: ['admin', 'usuario'] },
    { path: '/formularioInspeccion/:idLote/:id', element: <FormularioInspeccion />, roles: ['admin', 'usuario'] },
    { path: '/pdf_final', element: <Pdf_final />, roles: ['admin', 'usuario'] },

    // Parte de obra
    { path: '/parteObra', element: <GridParteDeObra />, roles: ['admin', 'usuario'] },
    { path: '/formularios', element: <ParteObra />, roles: ['admin', 'usuario'] },
    { path: '/verRegistros', element: <TablaRegistros />, roles: ['admin', 'usuario'] },
   



  ];

  return (
    <AuthProvider>
    
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
