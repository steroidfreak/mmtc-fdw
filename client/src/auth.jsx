import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [me, setMe] = useState(null);

    useEffect(() => {
        if (!token) { setMe(null); return; }
        api.get('/auth/me')
            .then(r => setMe(r.data))
            .catch(() => setMe(null));
    }, [token]);

    function login(t) { localStorage.setItem('token', t); setToken(t); }
    function logout() { localStorage.removeItem('token'); setToken(null); setMe(null); }

    return (
        <AuthCtx.Provider value={{ token, me, login, logout }}>
            {children}
        </AuthCtx.Provider>
    );
}

export function useAuth() {
    return useContext(AuthCtx);
}
