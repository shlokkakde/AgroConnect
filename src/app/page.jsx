'use client';
import { useLanguage } from '@/components/LanguageContext';
import Link from 'next/link';

export default function Home() {
    const { t, lang } = useLanguage();
    return (
        <div className="container" style={{ marginTop: '4rem', textAlign: 'center' }}>
            <h1 className="animate-fade-in hero-title" style={{ color: 'var(--text-main)', lineHeight: 1.2 }}>
                {t('heroTitle1')}<span style={{ color: 'var(--primary)' }}>{t('heroTitle2')}</span>{t('heroTitle3')}<span style={{ color: '#e9c46a' }}>{t('heroTitle4')}</span>{lang === 'hi' ? t('heroTitle5') : ''}
            </h1>
            <p className="animate-fade-in" style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem auto', animationDelay: '0.1s', opacity: 0 }}>
                {t('heroSub')}
            </p>

            <div className="animate-fade-in mobile-stack" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.2s', opacity: 0 }}>
                <Link href="/farmer" className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '300px', textDecoration: 'none', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚜</div>
                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{t('iAmFarmer')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('farmerSub')}</p>
                    <button className="btn btn-primary" style={{ width: '100%' }}>{t('farmerPortal')}</button>
                </Link>

                <Link href="/consumer" className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '300px', textDecoration: 'none', transition: 'transform 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{t('iAmConsumer')}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('consumerSub')}</p>
                    <button className="btn btn-primary" style={{ width: '100%', background: '#2a9d8f' }}>{t('consumerPortal')}</button>
                </Link>
            </div>
        </div>
    );
}
