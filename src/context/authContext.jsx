import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    OAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
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
    const [redirectResolved, setRedirectResolved] = useState(false);
    const [lastRedirectErrorCode, setLastRedirectErrorCode] = useState(null);
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

    // Login corporativo interactivo con popup (selector de cuenta).
    const loginWithMicrosoft = ({ prompt = 'select_account' } = {}) => {
        const provider = buildMicrosoftProvider({ prompt });
        return signInWithPopup(auth, provider);
    };

    // Login corporativo por redirect (misma pestaña).
    const loginWithMicrosoftRedirect = ({ prompt = 'select_account' } = {}) => {
        const provider = buildMicrosoftProvider({ prompt });
        return signInWithRedirect(auth, provider);
    };

    // Intenta SSO silencioso una sola vez por pestaña.
    const tryMicrosoftSsoSilently = async () => {
        if (typeof window === 'undefined') {
            return { status: 'skipped' };
        }

        const ssoAttemptedKey = 'ap4i_m365_sso_silent_attempted';
        if (window.sessionStorage.getItem(ssoAttemptedKey) === '1') {
            return { status: 'skipped' };
        }

        window.sessionStorage.setItem(ssoAttemptedKey, '1');
        try {
            await loginWithMicrosoftRedirect({ prompt: 'none' });
            return { status: 'redirect_started' };
        } catch (error) {
            return { status: 'failed', error };
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
        let mounted = true;

        const resolveRedirectResult = async () => {
            try {
                await getRedirectResult(auth);
                if (!mounted) return;
                setLastRedirectErrorCode(null);
            } catch (error) {
                if (!mounted) return;
                setLastRedirectErrorCode(error?.code || 'auth/unknown');
            } finally {
                if (mounted) {
                    setRedirectResolved(true);
                }
            }
        };

        resolveRedirectResult();
        return () => {
            mounted = false;
        };
    }, []);

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
                loginWithMicrosoftRedirect,
                tryMicrosoftSsoSilently,
                getMicrosoftLinkDataFromError,
                linkMicrosoftWithPassword,
                redirectResolved,
                lastRedirectErrorCode,
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
