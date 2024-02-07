import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import Admin from './Pages/Admin'
import Contacto from './Pages/Contacto'
import Footer from './Components/Footer'
import Modulos from './Pages/Modulos'
import Elementos from './Pages/Elementos'
import FormularioInspeccion from './Pages/FormularioInspeccion'

function App() {

  return (
    <>
    <Navbar/>

    <Routes>
      <Route path='/' element={<Home/>}></Route>
      <Route path='/admin' element={<Admin/>}></Route>
      <Route path='/contacto' element={<Contacto/>}></Route>
      <Route path='/modulos' element={<Modulos/>}></Route>
      <Route path='/elementos' element={<Elementos/>}></Route>
  
      <Route path='/formularioInspeccion' element={<FormularioInspeccion/>}></Route>
    </Routes>

    <Footer/>
     
    </>
  )
}

export default App
