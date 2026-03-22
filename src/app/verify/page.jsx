'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ShieldCheck, MailWarning, Send, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function VerifyPage() {
    const { user, verifyOtp, logout, loading } = useAuth();
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [confirmObj, setConfirmObj] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            window.location.href = '/login';
        } else if (!loading && user?.isVerified) {
            redirectUser({ role: user.role });
        }
    }, [user, loading]);

    useEffect(() => {
        if (!loading && user && typeof window !== 'undefined' && !window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible'
                });
            } catch (err) {
                console.error("Recaptcha Initialization Error:", err);
            }
        }
    }, [loading, user]);

    const redirectUser = (res) => {
        if (res.role === 'FARMER') window.location.href = '/farmer';
        else if (res.role === 'ADMIN') window.location.href = '/admin';
        else window.location.href = '/consumer';
    };

    const handleSendOTP = async () => {
        setError('');
        setSuccessMsg('');
        setIsLoading(true);

        if (!user.phone) {
            setError("Missing phone number in your session cache. Please Log Out below and Log In again to refresh your session!");
            setIsLoading(false);
            return;
        }

        try {
            const phoneNumber = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;

            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
            }

            const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);

            setConfirmObj(confirmationResult);
            setOtpSent(true);
            setSuccessMsg('OTP sent successfully!');
        } catch (err) {
            setError(err.message || 'Failed to send SMS using Firebase.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (confirmObj) {
            try {
                await confirmObj.confirm(otp);
                const res = await verifyOtp(user.id, '1234');
                if (res.success) redirectUser(res);
                else setError('Database update failed after Firebase verification.');
            } catch (err) {
                setError('Invalid Firebase Verification Code.');
                setIsLoading(false);
            }
        } else {
            const res = await verifyOtp(user.id, otp);
            if (res.success) {
                redirectUser(res);
            } else {
                setError(res.error || 'Mock Verification failed');
                setIsLoading(false);
            }
        }
    };

    if (loading || !user) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Security Gateway...</div>;

    return (
        <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>

                <h1 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <MailWarning color="var(--primary)" /> Security Checkpoint
                </h1>

                <p style={{ margin: '0', color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
                    To ensure platform security, we need to verify your phone number: <br /><b>{user.phone || <span style={{ color: 'var(--danger)' }}>Update Required</span>}</b>
                </p>

                {error && <div style={{ color: 'var(--danger)', background: '#ffeded', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                {successMsg && <div style={{ color: 'black', background: '#e9c46a', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>{successMsg}</div>}

                <div id="recaptcha-container"></div>

                {!otpSent ? (
                    <button onClick={handleSendOTP} disabled={isLoading} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.85rem' }}>
                        <Send size={18} style={{ marginRight: '0.5rem' }} /> {isLoading ? 'Sending Request...' : 'Send SMS Code'}
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                        <div>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="Enter Code"
                                style={{ textAlign: 'center', letterSpacing: '6px', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem' }}>
                            <ShieldCheck size={20} /> {isLoading ? 'Verifying Phone...' : 'Verify Phone'}
                        </button>
                    </form>
                )}

                <button type="button" onClick={logout} className="btn" style={{ marginTop: '0.5rem', background: 'transparent', color: 'var(--text-muted)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    <LogOut size={16} /> Wrong account or stuck? Log out
                </button>

            </div>
        </div>
    );
}
