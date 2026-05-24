import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (stored && token) {
            try { setUser(JSON.parse(stored)); } catch { localStorage.clear(); }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await authAPI.login(username, password);
        const { access_token, user: userData } = res.data;

        // Only allow login if role_id is not 2
        if (userData?.role_id === 3) {
            throw new Error('Access denied. Your role does not have permission to access this portal.');
        }

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    // role_id === 1 = admin (can manage users), role_id !== 1 = worker (cannot manage users)
    const isAdmin = user?.role_id === 1;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
