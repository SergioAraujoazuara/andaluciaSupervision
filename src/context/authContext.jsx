import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    OAuthProvider,
    signInWithPopup,
    fetchSignInMethodsForEmail,
    linkWithCredential
} from 'firebase/auth';
import { auth } from '../../firebase_config';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Funciones de contexto para obtener el user
export const authContext = createContext();

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) throw new Error('There is no authProvider');
    return context;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const db = getFirestore();

    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);

    const logout = () => signOut(auth);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const buildMicrosoftProvider = ({ prompt = 'select_account' } = {}) => {
        const provider = new OAuthProvider('microsoft.com');
        const tenantId = import.meta.env.VITE_AZURE_TENANT_ID?.trim();
        const customParams = { prompt };

        if (tenantId) {
            customParams.tenant = tenantId;
        } else {
            console.warn('VITE_AZURE_TENANT_ID no está definido; Microsoft puede usar /common.');
        }

        provider.setCustomParameters(customParams);
        return provider;
    };

    // Login corporativo: intenta SSO silencioso reutilizando sesión Microsoft del navegador.
    // Si no hay sesión activa o Microsoft requiere interacción, cae al selector de cuenta.
    const loginWithMicrosoft = async ({ prompt = 'select_account' } = {}) => {
        try {
            const silentProvider = buildMicrosoftProvider({ prompt: 'none' });
            return await signInWithPopup(auth, silentProvider);
        } catch (silentError) {
            const silentFailureCodes = [
                'auth/popup-closed-by-user',
                'auth/cancelled-popup-request',
                'auth/user-cancelled',
                'auth/internal-error',
            ];
            const microsoftSilentFailure =
                typeof silentError?.message === 'string' &&
                /interaction_required|login_required|consent_required|account_selection_required/i.test(silentError.message);

            if (silentFailureCodes.includes(silentError?.code) || microsoftSilentFailure) {
                const interactiveProvider = buildMicrosoftProvider({ prompt });
                return signInWithPopup(auth, interactiveProvider);
            }
            throw silentError;
        }
    };

    // Extrae datos necesarios cuando Microsoft responde que el email ya existe.
    const getMicrosoftLinkDataFromError = async (error) => {
        if (error?.code !== 'auth/account-exists-with-different-credential') {
            return null;
        }

        const email = error?.customData?.email || '';
        const pendingCredential = OAuthProvider.credentialFromError(error);
        if (!email || !pendingCredential) {
            return null;
        }

        const methods = await fetchSignInMethodsForEmail(auth, email);
        return { email, methods, pendingCredential };
    };

    // Vincula Microsoft con una cuenta existente autenticando primero por contraseña.
    const linkMicrosoftWithPassword = async (email, password, pendingCredential) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Si ya estaba vinculada no bloqueamos el flujo.
        try {
            await linkWithCredential(userCredential.user, pendingCredential);
        } catch (error) {
            if (error?.code !== 'auth/provider-already-linked' && error?.code !== 'auth/credential-already-in-use') {
                throw error;
            }
        }

        return userCredential;
    };

    // Garantiza que exista perfil base en Firestore para cualquier proveedor de login.
    const ensureUserProfile = async (firebaseUser) => {
        if (!firebaseUser?.uid) return null;

        const userRef = doc(db, 'usuarios', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        }

        const defaultUserData = {
            uid: firebaseUser.uid,
            nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email || '',
            proyectos: [],
            role: 'invitado',
        };
        await setDoc(userRef, defaultUserData);
        return defaultUserData;
    };

    const fetchUserRole = async (uid, profileData = null) => {
        if (profileData) {
            setRole(profileData.role || null);
            return;
        }

        const userRef = doc(db, 'usuarios', uid);
        const docSnap = await getDoc(userRef);
        setRole(docSnap.exists() ? docSnap.data().role || null : null);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            try {
                if (currentUser) {
                    setUser(currentUser);
                    const profileData = await ensureUserProfile(currentUser);
                    await fetchUserRole(currentUser.uid, profileData);
                } else {
                    setUser(null);
                    setRole(null);
                }
            } catch (error) {
                console.error('Error sincronizando sesión:', error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <authContext.Provider
            value={{
                signup,
                login,
                loginWithMicrosoft,
                getMicrosoftLinkDataFromError,
                linkMicrosoftWithPassword,
                user,
                role,
                logout,
                loading
            }}
        >
            {children}
        </authContext.Provider>
    );
}
