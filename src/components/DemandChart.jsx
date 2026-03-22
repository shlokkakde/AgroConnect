'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', demand: 400, price: 24 },
    { name: 'Tue', demand: 300, price: 22 },
    { name: 'Wed', demand: 550, price: 26 },
    { name: 'Thu', demand: 450, price: 25 },
    { name: 'Fri', demand: 700, price: 28 },
    { name: 'Sat', demand: 800, price: 30 },
    { name: 'Sun', demand: 600, price: 27 },
];

export default function DemandChart() {
    return (
        <div style={{ width: '100%', height: 200, marginTop: '1rem' }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Line type="monotone" dataKey="demand" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="price" stroke="#e9c46a" strokeWidth={3} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
