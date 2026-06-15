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

const SESSION_KEY = 'browser_session_active';
const EXPIRY_KEY = 'session_expiry';
const DEFAULT_DURATION_MS = 4 * 60 * 60 * 1000;

const writeSessionExpiry = (durationMs) => {
    const expiresAt = Date.now() + durationMs;
    localStorage.setItem(EXPIRY_KEY, String(expiresAt));
    return expiresAt;
};

const isSessionExpired = () => {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    return !expiry || Date.now() > Number(expiry);
};

const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRY_KEY);
};

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
    const [sessionExpiresAt, setSessionExpiresAt] = useState(() => {
        const stored = localStorage.getItem(EXPIRY_KEY);
        return stored ? Number(stored) : null;
    });
    const db = getFirestore();

    const readConfiguredDuration = async () => {
        try {
            const snap = await getDoc(doc(db, 'config', 'sesion'));
            const val = snap.exists() ? Number(snap.data()?.duracionMs) : 0;
            return val > 0 ? val : DEFAULT_DURATION_MS;
        } catch {
            return DEFAULT_DURATION_MS;
        }
    };

    const signup = async (email, password) => {
        const duration = await readConfiguredDuration();
        const expiresAt = writeSessionExpiry(duration);
        sessionStorage.setItem(SESSION_KEY, 'true');
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            setSessionExpiresAt(expiresAt);
            return result;
        } catch (error) {
            clearSession();
            throw error;
        }
    };

    const logout = () => {
        clearSession();
        setSessionExpiresAt(null);
        return signOut(auth);
    };

    const login = async (email, password) => {
        const duration = await readConfiguredDuration();
        const expiresAt = writeSessionExpiry(duration);
        sessionStorage.setItem(SESSION_KEY, 'true');
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            setSessionExpiresAt(expiresAt);
            return result;
        } catch (error) {
            clearSession();
            throw error;
        }
    };

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
    // Si el silencioso falla por cualquier razón, cae al selector de cuenta interactivo.
    const loginWithMicrosoft = async ({ prompt = 'select_account' } = {}) => {
        const duration = await readConfiguredDuration();
        const expiresAt = writeSessionExpiry(duration);
        sessionStorage.setItem(SESSION_KEY, 'true');
        try {
            const silentProvider = buildMicrosoftProvider({ prompt: 'none' });
            const result = await signInWithPopup(auth, silentProvider);
            setSessionExpiresAt(expiresAt);
            return result;
        } catch {
            try {
                const interactiveProvider = buildMicrosoftProvider({ prompt });
                const result = await signInWithPopup(auth, interactiveProvider);
                setSessionExpiresAt(expiresAt);
                return result;
            } catch (error) {
                clearSession();
                throw error;
            }
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
        const duration = await readConfiguredDuration();
        const expiresAt = writeSessionExpiry(duration);
        sessionStorage.setItem(SESSION_KEY, 'true');

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSessionExpiresAt(expiresAt);

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
                    if (!sessionStorage.getItem(SESSION_KEY) || isSessionExpired()) {
                        clearSession();
                        setSessionExpiresAt(null);
                        await signOut(auth);
                        return;
                    }
                    setSessionExpiresAt(Number(localStorage.getItem(EXPIRY_KEY)));
                    setUser(currentUser);
                    const profileData = await ensureUserProfile(currentUser);
                    await fetchUserRole(currentUser.uid, profileData);
                } else {
                    setUser(null);
                    setRole(null);
                    setSessionExpiresAt(null);
                }
            } catch (error) {
                console.error('Error sincronizando sesión:', error);
                setRole(null);
            } finally {
                setLoading(false);
            }
        });

        const expiryInterval = setInterval(async () => {
            if (auth.currentUser && isSessionExpired()) {
                clearSession();
                setSessionExpiresAt(null);
                await signOut(auth);
            }
        }, 30 * 1000);

        return () => {
            unsubscribe();
            clearInterval(expiryInterval);
        };
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
                loading,
                sessionExpiresAt,
            }}
        >
            {children}
        </authContext.Provider>
    );
}
