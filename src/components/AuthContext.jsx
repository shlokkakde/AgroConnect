'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('agro_user');
        if (savedUser) setUser(JSON.parse(savedUser));
        setLoading(false);
    }, []);

    const login = async (phone, password) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', phone, password })
            });
            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role, isVerified: data.data.isVerified };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const register = async (name, phone, email, password, role) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', name, phone, email, password, role })
            });
            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role, isVerified: data.data.isVerified };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const verifyOtp = async (userId, otp) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', userId, otp })
            });
            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role };
            }
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('agro_user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
