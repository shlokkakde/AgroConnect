'use client';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const { t, lang } = useLanguage();
    const { user, loading } = useAuth();
    const router = useRouter();

    // Automatically route authenticated users to their specific portal dashboard
    useEffect(() => {
        if (!loading && user && user.isVerified) {
            if (user.role === 'FARMER') router.push('/farmer');
            else if (user.role === 'ADMIN') router.push('/admin');
            else router.push('/consumer');
        }
    }, [user, loading, router]);

    return (
        <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
            <h1 className="animate-fade-in hero-title" style={{ color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('heroTitle1')}<span style={{ color: 'var(--primary)' }}>{t('heroTitle2')}</span>{t('heroTitle3')}<span style={{ color: '#e9c46a' }}>{t('heroTitle4')}</span>{lang === 'hi' ? t('heroTitle5') : ''}
            </h1>
            <p className="animate-fade-in" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto', animationDelay: '0.1s', opacity: 0 }}>
                {t('heroSub')}
            </p>

            {!loading && !user && (
                <>
                    <div className="animate-fade-in" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.2s', opacity: 0 }}>
                        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', width: '100%', maxWidth: '300px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>�</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>1. Secure Registration</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Sign up in seconds using your mobile number and our secure instant SMS verification system.</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', width: '100%', maxWidth: '300px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>2. Connect Directly</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Farmers list their fresh seasonal harvest, while consumers search for local produce nearby.</p>
                        </div>
                        <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', width: '100%', maxWidth: '300px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>3. Fair Economics</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>Zero middlemen taking commissions. Farmers earn what they deserve, and consumers pay less.</p>
                        </div>
                    </div>

                    <div className="animate-fade-in" style={{ margin: '4rem 0', animationDelay: '0.4s', opacity: 0 }}>
                        <Link href="/login" className="btn btn-primary" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem', borderRadius: '50px', boxShadow: '0 8px 25px rgba(46,161,105,0.4)' }}>
                            Join AgroConnect Now
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
