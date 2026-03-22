'use client';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Nav() {
    const { lang, toggleLang, t } = useLanguage();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="glass-panel navbar">
            <a href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none', zIndex: 100 }}>
                🌾 {t('appName')}
            </a>

            {/* Mobile Hamburger Icon */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Links Container */}
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <a href="/farmer" style={{ fontWeight: 500 }} onClick={() => setMenuOpen(false)}>{t('farmerPortal')}</a>
                <a href="/consumer" style={{ fontWeight: 500 }} onClick={() => setMenuOpen(false)}>{t('consumerPortal')}</a>

                {user?.role === 'ADMIN' && (
                    <a href="/admin" style={{ fontWeight: 500, color: '#e63946' }} onClick={() => setMenuOpen(false)}>Admin Panel</a>
                )}

                <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)', display: 'inline-block' }} className="desktop-only-divider"></div>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                            <User size={18} /> {user.name} ({user.role})
                        </span>
                        <button className="btn" onClick={logout} style={{ padding: '0.5rem', color: 'var(--danger)', background: '#ffeded', display: 'flex', alignItems: 'center', gap: '0.5rem' }} title="Logout">
                            <LogOut size={16} /> <span className="mobile-only-text" style={{ display: 'none' }}>Logout</span>
                        </button>
                    </div>
                ) : (
                    <a href="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }} onClick={() => setMenuOpen(false)}>Login</a>
                )}

                <button className="btn" onClick={toggleLang} style={{ padding: '0.5rem 1.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    {lang === 'en' ? 'हिंदी' : 'English'}
                </button>
            </div>
        </nav>
    );
}
