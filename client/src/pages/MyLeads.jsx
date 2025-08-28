import { useEffect, useState } from 'react';
import api from '../api';
import HelperCard from '../components/HelperCard';
import useShortlist from '../hooks/useShortlist.jsx';

export default function MyLeads() {
    const [items, setItems] = useState([]);
    const [shortlist, setShortlist] = useState([]);
    const [err, setErr] = useState('');
    const { toggle } = useShortlist();

    useEffect(() => {
        api.get('/leads/my')
            .then(r => setItems(r.data))
            .catch(e => setErr(e?.response?.data?.error || 'Failed to load'));

        api.get('/jobs/active/shortlist')
            .then(r => setShortlist(r.data.shortlist || []))
            .catch(() => {});
    }, []);

    if (err) return <p style={{ color: 'crimson' }}>{err}</p>;
    return (
        <>
            <h1>My Shortlisted Helpers</h1>
            {shortlist.length === 0 && <p>No shortlisted helpers yet.</p>}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 16,
                marginBottom: 32
            }}>
                {shortlist.map(h => (
                    <HelperCard
                        key={h._id}
                        h={h}
                        shortlisted
                        onToggle={async (id) => {
                            try {
                                await toggle(id);
                                setShortlist(prev => prev.filter(x => x._id !== id));
                            } catch (e) {
                                alert(e.message || 'Failed');
                            }
                        }}
                    />
                ))}
            </div>

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
