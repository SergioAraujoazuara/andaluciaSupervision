import React, { useContext, useState } from 'react'
import { createContext } from 'react'
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from 'firebase/auth'
import {auth} from '../../firebase_config'
import { useEffect } from 'react'

// Funciones de contexto para obtener el user
export const authContext = createContext()

export const useAuth = () => {
     const context = useContext(authContext)
     if(!context) throw new Error('There is not authProvider')
     return context
}

export function AuthProvider ({children}) {
    // Funcion design up para acceder con password y user

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password)

    const logout = () => signOut(auth)
    

    const login = async (email, password) => signInWithEmailAndPassword(auth, email, password)
        

    useEffect(()=>{
        onAuthStateChanged(auth, currentUser => {
            setUser(currentUser)
            setLoading(false)
        })
    }, [])
    


    return (
       <authContext.Provider value={{signup, login, user, logout, loading}}>
            {children}
       </authContext.Provider> 
    )
}