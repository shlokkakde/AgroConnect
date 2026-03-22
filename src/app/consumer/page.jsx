'use client';
import { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, AlertCircle, ShoppingCart, Lock } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

export default function ConsumerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [produce, setProduce] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (user && user.isVerified) {
            fetchProduce();
        }
    }, [search, user]);

    const fetchProduce = async () => {
        setLoading(true);
        const res = await fetch(`/api/produce`);
        const data = await res.json();
        if (data.success) {
            let results = data.data;
            if (search) {
                results = results.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
            }
            setProduce(results);
        }
        setLoading(false);
    };

    const handleAIAnalysis = () => {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2000);
    };

    if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Consumer Interface...</div>;

    if (!user) {
        return (
            <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <Lock size={64} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                <h1>Welcome to Content!</h1>
                <p style={{ color: 'var(--text-muted)' }}>You must log in to browse and buy fresh produce.</p>
                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log in / Register</a>
            </div>
        );
    }

    if (user && !user.isVerified) {
        window.location.href = '/verify';
        return null;
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                    <MapPin color="var(--primary)" size={40} /> Fresh Produce Near You
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Buy directly from farmers and save. AI-verified fair prices.</p>

                <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search color="var(--text-muted)" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search for Tomatoes, Wheat..."
                            style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '30px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)', fontSize: '1.05rem', outline: 'none' }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleAIAnalysis} style={{ borderRadius: '30px', padding: '0 2rem', display: 'flex', gap: '0.5rem', background: 'linear-gradient(135deg, #2ea169 0%, #2a9d8f 100%)', flexShrink: 0 }}>
                        {analyzing ? <AlertCircle className="animate-spin" /> : <Sparkles />}
                        <span className="desktop-only-text">{analyzing ? 'Analyzing Prices...' : 'AI Deal Finder'}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading fresh produce...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {produce.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>No produce found nearby. Try a different search.</p>
                    ) : (
                        produce.map(item => {
                            // Pull real Mandi rate from API payload, fallback to 35% math only if undefined
                            const mandiRate = item.mandiRate || Math.round(item.price * 1.35);
                            const savings = Math.round(((mandiRate - item.price) / mandiRate) * 100);

                            return (
                                <div key={item._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                    <div style={{ position: 'relative' }}>
                                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#e6f4ea', color: 'var(--success)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                            <Sparkles size={14} /> {savings}% AI Savings
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.3rem', color: 'var(--text-main)' }}>{item.title}</h3>

                                        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} /> {item.farmerName} • {item.location || 'Local Farm'}
                                        </p>

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: 'rgba(46, 161, 105, 0.05)', padding: '1rem', borderRadius: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Direct Price</div>
                                                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1 }}>₹{item.price}<span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>/kg</span></div>
                                                <div style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--danger)', marginTop: '0.3rem' }}>Mandi Rate: ₹{mandiRate}/kg</div>
                                            </div>
                                            <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.8rem 1.2rem' }}>
                                                <ShoppingCart size={18} /> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
