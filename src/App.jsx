import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'

import Contacto from './Pages/Contacto'
import Footer from './Components/Footer'
import Modulos from './Pages/Modulos'


import TablaPpi from './Pages/TablaPpi'
import FormularioInspeccion from './Components/FormularioInspeccion'
import AdminHome from './Pages/Administrador/AdminHome'
import CrearProyecto from './Pages/Administrador/CrearProyecto'
import ViewProject from './Pages/Administrador/ViewProject'
import EditProject from './Pages/Administrador/EditProject'
import Elemento from './Pages/Elemento'

import Trazabilidad from './Pages/Administrador/Trazabilidad'
import AgregarPPi from './Pages/Administrador/AgregarPPi'
import VerPpis from './Pages/Administrador/VerPpis'
import EditarPpi from './Pages/Administrador/EditarPpi'
import Viewer_inspeccion from './Viewer_inspeccion'
import Viewer_admin from './Viewer_admin'
import { AuthProvider } from './context/authContext.jsx';
import ProtectedRoutes from './ProtectedRoutes.jsx';
import AuthTabs from './Login/AuthTabs.jsx';
import Login from './Login/Login.jsx'
import Register from './Login/Register.jsx'
import Pdf_final from './Components/Pdf_final.jsx'

function App() {

  return (
    <>
      <AuthProvider>
        <Navbar />

        <Routes>

        <Route path='/' element={
              <ProtectedRoutes>
                <Home />
              </ProtectedRoutes>
            } />
          
          <Route path='/authTabs' element={<AuthTabs />} />

          <Route path='/admin' element={<AdminHome />}></Route>
          <Route path='/crearProyecto' element={<CrearProyecto />}></Route>
          <Route path='/viewProject' element={<ViewProject />}></Route>
          <Route path='/editProject/:id' element={<EditProject />}></Route>
          <Route path='/trazabilidad/:id' element={<Trazabilidad />}></Route>
          <Route path='/verPPis' element={<VerPpis />}></Route>
          <Route path='/agregarPpi' element={<AgregarPPi />}></Route>

          <Route path='/visor_inspeccion' element={<Viewer_inspeccion />}></Route>
          <Route path='/visorAdmin' element={<Viewer_admin />}></Route>

          <Route path='/contacto' element={<Contacto />}></Route>
          <Route path='/modulos' element={<Modulos />}></Route>
          <Route path='/elemento' element={<Elemento />}></Route>
          <Route path='/elemento/:id' element={<Elemento />}></Route>


          <Route path='/tablaPpi' element={<TablaPpi />}></Route>
          <Route path='/tablaPpi/:idLote/:ppiNombre' element={<TablaPpi />}></Route>
          <Route path='/editarPpi/:id' element={<EditarPpi />}></Route>
          <Route path='/formularioInspeccion/:idLote/:id' element={<FormularioInspeccion />}></Route>

          <Route path='/pdf_final' element={<Pdf_final />}></Route>
        </Routes>

        <Footer />

      </AuthProvider>

    </>
  )
}

export default App
