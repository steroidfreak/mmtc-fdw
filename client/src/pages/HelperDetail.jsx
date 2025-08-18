import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../auth.jsx';
import InterviewModal from '../components/InterviewModal.jsx';

export default function HelperDetail() {
    const { id } = useParams();
    const { me } = useAuth();
    const [h, setH] = useState(null);
    const [shortlisted, setShortlisted] = useState(false);
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const r = await api.get(`/helpers/${id}`);
                setH(r.data);

                if (me) {
                    const s = await api.get('/jobs/active/shortlist');
                    setShortlisted((s.data.shortlist || []).some(x => x._id === id));
                }
            } catch { setMsg('Not found'); }
        })();
    }, [id, me]);

    if (msg) return <p>{msg}</p>;
    if (!h) return <p>Loading…</p>;

    async function toggleShortlist() {
        try {
            if (!me) { setMsg('Please login to save shortlist.'); return; }
            if (shortlisted) {
                await api.delete(`/jobs/active/shortlist/${id}`);
                setShortlisted(false);
            } else {
                await api.post('/jobs/active/shortlist', { helperId: id });
                setShortlisted(true);
            }
        } catch (e) {
            setMsg(e?.response?.data?.error || 'Failed to update shortlist');
        }
    }

    return (
        <>
            <Link to="/helpers">← Back to list</Link>
            <h1>{h.name} <small>({h.nationality})</small></h1>
            <p><b>Experience:</b> {h.experience} yr(s)</p>
            <p><b>Skills:</b> {Array.isArray(h.skills) ? h.skills.join(', ') : '-'}</p>
            <p><b>Availability:</b> {h.availability ? 'Available' : 'Not available'}</p>
            <p><b>Expected Salary:</b> {h.expectedSalary ? `S$${h.expectedSalary}` : '-'}</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button onClick={toggleShortlist}>
                    {shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                </button>
                <button onClick={() => setOpen(true)}>Book interview</button>
                <Link to="/shortlist">View shortlist</Link>
            </div>

            {msg && <p style={{ color: 'crimson' }}>{msg}</p>}

            <InterviewModal open={open} onClose={() => setOpen(false)} helper={h} />
        </>
    );
}
