import React from 'react'
import { useAuth } from './context/authContext'
import {Navigate} from 'react-router-dom'

function ProtectedRoutes({children}) {

    const {user, loading } = useAuth()

    if(loading) return <h1>Cargando...</h1>

    if(!user) return <Navigate to='/authTabs'/>

  return <>{children}</>
}

export default ProtectedRoutes