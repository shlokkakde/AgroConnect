'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, PlusCircle, Leaf, Trash2, Sprout, Lock, AlertTriangle } from 'lucide-react';
import DemandChart from '@/components/DemandChart';
import { useAuth } from '@/components/AuthContext';

export default function FarmerDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [produce, setProduce] = useState([]);
    const [formData, setFormData] = useState({ title: '', price: '', quantity: '', location: '', image: '' });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (user?.role === 'FARMER' && user?.isVerified) {
            fetchProduce();
        }
    }, [user]);

    const fetchProduce = async () => {
        if (!user) return;
        const res = await fetch(`/api/produce?farmer=${encodeURIComponent(user.name)}`);
        const data = await res.json();
        if (data.success) {
            setProduce(data.data);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        const res = await fetch('/api/produce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, farmerName: user.name, farmerPhone: user.phone, farmerEmail: user.email })
        });
        const data = await res.json();
        if (data.success) {
            setFormData({ title: '', price: '', quantity: '', location: '', image: '' });
            fetchProduce();
            showToast('Produce Listed Successfully!');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        await fetch(`/api/produce?id=${id}`, { method: 'DELETE' });
        fetchProduce();
        showToast('Listing Removed');
    };

    if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;

    if (user && !user.isVerified) {
        window.location.href = '/verify';
        return null;
    }

    if (!user || user.role !== 'FARMER') {
        return (
            <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <Lock size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                <h1>Restricted Access</h1>
                <p style={{ color: 'var(--text-muted)' }}>You must log in as a Farmer to access the seller dashboard.</p>
                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Login</a>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '2rem', right: '2rem', background: 'var(--success)', color: 'white', padding: '1rem 2rem', borderRadius: '8px', boxShadow: 'var(--card-shadow)', zIndex: 100, animation: 'fadeIn 0.3s ease' }}>
                    {toast}
                </div>
            )}

            <div style={{ flex: '1 1 350px' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlusCircle color="var(--primary)" /> List New Produce
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Crop Title (e.g. Organic Tomatoes)"
                            required
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none' }}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Location (e.g. Pune, MH)"
                            required
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none' }}
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                        <input
                            type="url"
                            placeholder="Image URL (Public link to photo)"
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none' }}
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input
                                type="number"
                                placeholder="Price per kg (₹)"
                                required
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none' }}
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Quantity (kg)"
                                required
                                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)', outline: 'none' }}
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <Leaf size={18} /> {loading ? 'Listing...' : 'Publish Listing'}
                        </button>
                    </form>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', background: 'rgba(233, 196, 106, 0.1)' }}>
                    <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp color="#e9c46a" /> Demand Forecast
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>AI Model predicts Mandi rates for Tomatoes will rise by 12% next week. Consider holding inventory!</p>
                    <DemandChart />
                </div>
            </div>

            <div style={{ flex: '2 1 500px' }}>
                <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sprout color="var(--primary)" /> Your Active Listings
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    {produce.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--glass-border)', borderRadius: '12px' }}>
                            <Sprout size={48} opacity={0.3} style={{ marginBottom: '1rem' }} />
                            <p>No active listings. Add some produce to start selling directly to consumers.</p>
                        </div>
                    ) : (
                        produce.map(item => (
                            <div key={item._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <img 
                                    src={item.image || 'https://images.unsplash.com/photo-1595856453669-e970a2fdfde1?q=80&w=600&auto=format&fit=crop'} 
                                    alt={item.title} 
                                    onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1595856453669-e970a2fdfde1?q=80&w=600&auto=format&fit=crop"; }}
                                    style={{ width: '100%', height: '160px', objectFit: 'cover' }} 
                                />
                                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.title}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
                                        <span>₹{item.price} / kg</span>
                                        <span>{item.quantity} kg left</span>
                                    </div>
                                    <button onClick={() => handleDelete(item._id)} className="btn" style={{ marginTop: 'auto', width: '100%', background: '#ffeded', color: 'var(--danger)', padding: '0.6rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                        <Trash2 size={18} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
