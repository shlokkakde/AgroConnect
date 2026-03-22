'use client';
import { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', password: '', role: 'FARMER' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        let res;
        if (mode === 'login') {
            res = await login(formData.phone, formData.password);
        } else {
            res = await register(formData.name, formData.phone, formData.email, formData.password, formData.role);
        }

        if (res.success) {
            if (!res.isVerified) window.location.href = '/verify';
            else if (res.role === 'FARMER') window.location.href = '/farmer';
            else if (res.role === 'ADMIN') window.location.href = '/admin';
            else window.location.href = '/consumer';
        } else {
            setError(res.error || 'Authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', background: 'var(--glass-border)', padding: '0.4rem', borderRadius: '12px', gap: '0.4rem' }}>
                    <button
                        type="button"
                        className="btn"
                        style={{ flex: 1, background: mode === 'login' ? 'white' : 'transparent', color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                        onClick={() => { setMode('login'); setError(''); }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className="btn"
                        style={{ flex: 1, background: mode === 'register' ? 'white' : 'transparent', color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                        onClick={() => { setMode('register'); setError(''); }}
                    >
                        Register
                    </button>
                </div>

                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        {mode === 'login' ? <LogIn color="var(--primary)" /> : <UserPlus color="var(--primary)" />}
                        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {mode === 'login' ? 'Enter your phone and password to sign in.' : 'Join AgroConnect for direct farm-to-table access.'}
                    </p>
                </div>

                {error && <div style={{ color: 'var(--danger)', background: '#ffeded', padding: '0.75rem', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {mode === 'register' && (
                        <>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ramesh Kumar"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Email Address (optional)</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="farmer@email.com"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Phone Number</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            placeholder={mode === 'login' ? "10-digit number or username" : "10-digit number"}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            className="input-field"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                        />
                    </div>

                    {mode === 'register' && (
                        <div style={{ marginTop: '0.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 500, fontSize: '0.9rem' }}>I want to...</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'FARMER' })}
                                    style={{ flex: 1, border: `2px solid ${formData.role === 'FARMER' ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: formData.role === 'FARMER' ? 'rgba(46,161,105,0.05)' : 'transparent', transition: 'all 0.2s' }}
                                >
                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🚜</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sell Produce</span>
                                </div>
                                <div
                                    onClick={() => setFormData({ ...formData, role: 'CONSUMER' })}
                                    style={{ flex: 1, border: `2px solid ${formData.role === 'CONSUMER' ? 'var(--primary)' : 'var(--glass-border)'}`, borderRadius: '8px', padding: '1rem', textAlign: 'center', cursor: 'pointer', background: formData.role === 'CONSUMER' ? 'rgba(46,161,105,0.05)' : 'transparent', transition: 'all 0.2s' }}
                                >
                                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🛒</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Buy Produce</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}>
                        {mode === 'login' ? <ShieldCheck size={20} /> : <UserPlus size={20} />}
                        {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In Securely' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
}
