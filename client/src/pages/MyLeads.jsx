import { useEffect, useState } from 'react';
import api from '../api';

export default function MyLeads() {
    const [items, setItems] = useState([]);
    const [err, setErr] = useState('');

    useEffect(() => {
        api.get('/leads/my')
            .then(r => setItems(r.data))
            .catch(e => setErr(e?.response?.data?.error || 'Failed to load'));
    }, []);

    if (err) return <p style={{ color: 'crimson' }}>{err}</p>;
    return (
        <>
            <h1>My Interview Requests</h1>
            {items.length === 0 && <p>No leads yet.</p>}
            <div style={{ display: 'grid', gap: 12 }}>
                {items.map(l => (
                    <div key={l._id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
                        <div><b>Helper:</b> {l.helperId?.name}</div>
                        <div><b>Preferred time:</b> {l.preferredTime ? new Date(l.preferredTime).toLocaleString() : '-'}</div>
                        <div><b>Message:</b> {l.message || '-'}</div>
                        <div><b>Contact:</b> {l.contact?.phone || l.contact?.email || '-'}</div>
                        <div><b>Status:</b> {l.status}</div>
                    </div>
                ))}
            </div>
        </>
    );
}
