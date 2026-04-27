'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const readErrorResponse = async (res) => {
        const fallback = `Request failed (${res.status})`;

        try {
            const data = await res.json();
            return data.error || fallback;
        } catch {
            try {
                const text = await res.text();
                return text || fallback;
            } catch {
                return fallback;
            }
        }
    };

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

            if (!res.ok) {
                return { success: false, error: await readErrorResponse(res) };
            }

            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role, isVerified: data.data.isVerified };
            }
            return { success: false, error: data.error };
        } catch (e) {
            console.error('Login request failed:', e);
            return { success: false, error: e.message || 'Network error' };
        }
    };

    const register = async (name, phone, email, password, role) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'register', name, phone, email, password, role })
            });

            if (!res.ok) {
                return { success: false, error: await readErrorResponse(res) };
            }

            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role, isVerified: data.data.isVerified };
            }
            return { success: false, error: data.error };
        } catch (e) {
            console.error('Register request failed:', e);
            return { success: false, error: e.message || 'Network error' };
        }
    };

    const verifyOtp = async (userId, otp) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', userId, otp })
            });

            if (!res.ok) {
                return { success: false, error: await readErrorResponse(res) };
            }

            const data = await res.json();

            if (data.success) {
                const userData = { id: data.data._id, name: data.data.name, role: data.data.role, isVerified: data.data.isVerified, phone: data.data.phone };
                setUser(userData);
                localStorage.setItem('agro_user', JSON.stringify(userData));
                return { success: true, role: data.data.role };
            }
            return { success: false, error: data.error };
        } catch (e) {
            console.error('OTP verification request failed:', e);
            return { success: false, error: e.message || 'Network error' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('agro_user');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOtp, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
