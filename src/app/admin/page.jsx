'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { ShieldAlert, Users, Sprout, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [produce, setProduce] = useState([]);

    useEffect(() => {
        if (user?.role === 'ADMIN' && user?.isVerified) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        const resUsers = await fetch('/api/users');
        const dbUsers = await resUsers.json();
        if (dbUsers.success) setUsers(dbUsers.data);

        const resProduce = await fetch('/api/produce');
        const dbProduce = await resProduce.json();
        if (dbProduce.success) setProduce(dbProduce.data);
    };

    const updateUser = async (userId, field, value) => {
        // Prevent modifying the hardcoded master admin visually (though api blocks it too)
        if (userId === 'admin_id') return;

        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'adminUpdate', userId, updateFields: { [field]: value } })
        });
        fetchData(); // Immediately refresh the table to reflect the DB change
    };

    const deleteUser = async (id) => {
        if (id === 'admin_id') return alert("Cannot delete the Master Admin.");
        if (!confirm('Are you sure you want to delete this user?')) return;
        await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    const deleteProduce = async (id) => {
        if (!confirm('Are you sure you want to delete this listing?')) return;
        await fetch(`/api/produce?id=${id}`, { method: 'DELETE' });
        fetchData();
    };

    if (authLoading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

    if (user && !user.isVerified) {
        window.location.href = '/verify';
        return null;
    }

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
                <ShieldAlert size={64} color="var(--danger)" style={{ marginBottom: '1rem' }} />
                <h1>Restricted Access</h1>
                <p style={{ color: 'var(--text-muted)' }}>You need Administrator privileges to view this page.</p>
                <a href="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Login as Admin</a>
            </div>
        );
    }

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <ShieldAlert color="#e63946" /> Master Control Panel
                </h1>

                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <button
                        className="btn"
                        style={{ padding: '0.5rem 1rem', background: activeTab === 'users' ? 'var(--primary)' : 'transparent', color: activeTab === 'users' ? 'white' : 'var(--text-main)' }}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem' }} /> Users
                    </button>
                    <button
                        className="btn"
                        style={{ padding: '0.5rem 1rem', background: activeTab === 'produce' ? '#e9c46a' : 'transparent', color: activeTab === 'produce' ? '#1d3527' : 'var(--text-main)' }}
                        onClick={() => setActiveTab('produce')}
                    >
                        <Sprout size={18} style={{ marginRight: '0.5rem' }} /> Produce Listings
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
                {activeTab === 'users' ? (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Role</th>
                                <th style={{ padding: '1rem' }}>Verification</th>
                                <th style={{ padding: '1rem' }}>Phone/Email</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>

                                    {/* Inline Role Modifier */}
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={u.role}
                                            onChange={(e) => updateUser(u._id, 'role', e.target.value)}
                                            style={{
                                                padding: '0.4rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)',
                                                background: u.role === 'ADMIN' ? '#ffeded' : u.role === 'FARMER' ? '#e6f4ea' : '#e3f2fd',
                                                color: u.role === 'ADMIN' ? '#e63946' : u.role === 'FARMER' ? 'var(--primary)' : '#1976d2',
                                                fontWeight: '600',
                                                outline: 'none',
                                                cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={u.role === 'ADMIN'}
                                            title={u.role === 'ADMIN' ? "Cannot modify Master Admin" : "Change User Role"}
                                        >
                                            <option value="FARMER">FARMER</option>
                                            <option value="CONSUMER">CONSUMER</option>
                                            {u.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                                        </select>
                                    </td>

                                    {/* Inline Verification Modifier */}
                                    <td style={{ padding: '1rem' }}>
                                        <select
                                            value={u.isVerified ? 'true' : 'false'}
                                            onChange={(e) => updateUser(u._id, 'isVerified', e.target.value === 'true')}
                                            style={{
                                                padding: '0.4rem',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)',
                                                background: u.isVerified ? '#e6f4ea' : '#fff3cd',
                                                color: u.isVerified ? 'var(--success)' : 'var(--warning)',
                                                fontWeight: '600',
                                                outline: 'none',
                                                cursor: u.role === 'ADMIN' ? 'not-allowed' : 'pointer'
                                            }}
                                            disabled={u.role === 'ADMIN'}
                                            title={u.role === 'ADMIN' ? "Master Admin is always verified" : "Change Verification Status"}
                                        >
                                            <option value="true">✅ Verified</option>
                                            <option value="false">⏳ Pending</option>
                                        </select>
                                    </td>

                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {u.phone} {u.email && <><br />{u.email}</>}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button
                                            onClick={() => deleteUser(u._id)}
                                            className="btn"
                                            style={{ padding: '0.4rem', color: u.role === 'ADMIN' ? '#ccc' : 'var(--danger)', background: u.role === 'ADMIN' ? 'transparent' : '#ffeded' }}
                                            title="Delete User"
                                            disabled={u.role === 'ADMIN'}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>}
                        </tbody>
                    </table>
                ) : (
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--glass-border)' }}>
                                <th style={{ padding: '1rem' }}>Crop</th>
                                <th style={{ padding: '1rem' }}>Farmer Base Price</th>
                                <th style={{ padding: '1rem' }}>Quantity</th>
                                <th style={{ padding: '1rem' }}>Posted By</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produce.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <img src={p.image} alt={p.title} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                        {p.title}
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>₹{p.price}</td>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.quantity} kg</td>
                                    <td style={{ padding: '1rem' }}>👨‍🌾 {p.farmerName}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => deleteProduce(p._id)} className="btn" style={{ padding: '0.4rem', color: 'var(--danger)', background: '#ffeded' }} title="Remove Listing">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {produce.length === 0 && <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No produce found.</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
