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

function App() {

  return (
    <>
    <Navbar/>

    <Routes>
      <Route path='/' element={<Home/>}></Route>

      <Route path='/admin' element={<AdminHome/>}></Route>
      <Route path='/crearProyecto' element={<CrearProyecto/>}></Route>
      <Route path='/viewProject' element={<ViewProject/>}></Route>
      <Route path='/editProject/:id' element={<EditProject/>}></Route>
      <Route path='/trazabilidad/:id' element={<Trazabilidad/>}></Route>
      <Route path='/verPPis' element={<VerPpis/>}></Route>
      <Route path='/agregarPpi' element={<AgregarPPi/>}></Route>

      <Route path='/contacto' element={<Contacto/>}></Route>
      <Route path='/modulos' element={<Modulos/>}></Route>
      <Route path='/elemento' element={<Elemento/>}></Route>
      
  
      <Route path='/tablaPpi' element={<TablaPpi/>}></Route>
      <Route path='/formularioInspeccion' element={<FormularioInspeccion/>}></Route>
    </Routes>

    <Footer/>
     
    </>
  )
}

export default App
